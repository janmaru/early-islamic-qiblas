import os
import json
import math
from qgis.core import (QgsVectorLayer, QgsProject, QgsFeature, QgsGeometry, 
    QgsPointXY, QgsField, QgsRasterMarkerSymbolLayer, QgsSymbol, QgsSingleSymbolRenderer)
from qgis.PyQt.QtCore import Qt, QVariant
from qgis.PyQt.QtGui import QIcon
from qgis.PyQt.QtWidgets import QAction, QMessageBox, QDialog, QVBoxLayout, QPushButton, QLabel

class EarlyIslamicQiblasPlugin:
    def __init__(self, iface):
        self.iface = iface
        self.plugin_dir = os.path.dirname(__file__)
        self.action = None
        self.dialog = None
        self.mosques_file = os.path.join(self.plugin_dir, "assets", "mosques.json")
        self.icon_path = os.path.join(self.plugin_dir, "assets", "icon.png")

    def initGui(self):
        self.action = QAction(QIcon(self.icon_path), "Early Islamic Qiblas", self.iface.mainWindow())
        self.action.triggered.connect(self.run)
        
        self.iface.addPluginToMenu("&Early Islamic Qiblas", self.action)
        self.iface.addToolBarIcon(self.action)

    def unload(self):
        self.iface.removePluginMenu("&Early Islamic Qiblas", self.action)
        self.iface.removeToolBarIcon(self.action)

    def run(self):
        if not self.dialog:
            self.dialog = self.create_dialog()
        self.dialog.show()

    def create_dialog(self):
        dialog = QDialog(self.iface.mainWindow())
        dialog.setWindowTitle("Early Islamic Qiblas (Standalone)")
        layout = QVBoxLayout()

        status_label = QLabel(f"Data source: {os.path.basename(self.mosques_file)}")
        layout.addWidget(status_label)

        load_btn = QPushButton("Load Mosques")
        load_btn.clicked.connect(self.load_mosques)
        layout.addWidget(load_btn)

        centroid_btn = QPushButton("Calculate Centroid")
        centroid_btn.clicked.connect(self.calculate_centroid)
        layout.addWidget(centroid_btn)

        dialog.setLayout(layout)
        return dialog

    def load_data(self):
        if not os.path.exists(self.mosques_file):
            raise FileNotFoundError(f"Missing data file: {self.mosques_file}")
        with open(self.mosques_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def load_mosques(self):
        try:
            mosques = self.load_data()
            
            # Create GeoJSON FeatureCollection
            features = []
            for m in mosques:
                coords = [m.get('Lon', 0), m.get('Lat', 0)]
                
                description = f"<h3>{m.get('MosqueName', 'Unknown')}</h3>"
                description += f"<b>City:</b> {m.get('City', '')}<br/>"
                description += f"<b>Country:</b> {m.get('Country', '')}<br/>"
                description += f"<b>Age Group:</b> {m.get('AgeGroup', '')}<br/>"
                description += f"<b>Year CE:</b> {m.get('YearCE', '')}<br/>"
                description += f"<b>Year AH:</b> {m.get('YearAH', '')}<br/>"
                description += f"<b>Rebuilt:</b> {m.get('Rebuilt', '')}<br/>"

                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": coords
                    },
                    "properties": {
                        "title": m.get('MosqueName', ''),
                        "description": description,
                        "more_info_url": m.get('MoreInfo', '')
                    }
                }
                features.append(feature)

            geojson = {
                "type": "FeatureCollection",
                "features": features
            }
            
            vlayer = QgsVectorLayer(json.dumps(geojson), "Mosques (Standalone)", "ogr")
            if not vlayer.isValid():
                QMessageBox.critical(self.iface.mainWindow(), "Error", "Failed to load layer.")
                return

            # --- Set Custom Symbology (Mosque Icon) ---
            if os.path.exists(self.icon_path):
                symbol_layer = QgsRasterMarkerSymbolLayer(self.icon_path)
                symbol_layer.setSize(6.0)
                
                symbol = QgsSymbol.defaultSymbol(vlayer.geometryType())
                symbol.changeSymbolLayer(0, symbol_layer)
                
                renderer = QgsSingleSymbolRenderer(symbol)
                vlayer.setRenderer(renderer)

            # --- Configure Map Tips (Popups) ---
            # Using a slightly different approach for links in Map Tips
            map_tip_template = '[% "description" %]'
            vlayer.setMapTipTemplate(map_tip_template)

            # To make links clickable in Map Tips, we sometimes need to use a specific QGIS action
            # or rely on the user clicking the feature with the Identify Tool.
            # However, for a better UX, let's also add a "Feature Action" to open the URL.
            
            from qgis.core import QgsAction
            action_manager = vlayer.actions()
            action_manager.addAction(QgsAction.GenericPython, "Open More Info", 
                "import webbrowser\nwebbrowser.open('[% \"more_info_url\" %]')", True)

            QgsProject.instance().addMapLayer(vlayer)
            
            QMessageBox.information(self.iface.mainWindow(), "Success", 
                f"Loaded {len(features)} mosques.\n\n"
                "To see details:\n"
                "1. Enable 'View > Map Tips'\n"
                "2. To open 'More Info', right-click the mosque and select 'Actions > Open More Info'")
        except Exception as e:
            QMessageBox.critical(self.iface.mainWindow(), "Error", str(e))

    def calculate_centroid(self):
        try:
            mosques = self.load_data()
            # 3D Geographic Centroid Logic
            sum_x = 0.0
            sum_y = 0.0
            sum_z = 0.0
            count = 0

            for m in mosques:
                lon_deg = m.get('Lon')
                lat_deg = m.get('Lat')
                if lon_deg is None or lat_deg is None:
                    continue
                
                lon = math.radians(lon_deg)
                lat = math.radians(lat_deg)
                
                x = math.cos(lat) * math.cos(lon)
                y = math.cos(lat) * math.sin(lon)
                z = math.sin(lat)
                
                sum_x += x
                sum_y += y
                sum_z += z
                count += 1

            if count == 0:
                QMessageBox.warning(self.iface.mainWindow(), "Warning", "No mosque data found.")
                return

            avg_x = sum_x / count
            avg_y = sum_y / count
            avg_z = sum_z / count

            lon_res = math.atan2(avg_y, avg_x)
            hyp = math.sqrt(avg_x * avg_x + avg_y * avg_y)
            lat_res = math.atan2(avg_z, hyp)

            lon_deg_res = math.degrees(lon_res)
            lat_deg_res = math.degrees(lat_res)

            vlayer = QgsVectorLayer("Point?crs=EPSG:4326", "Centroid (Standalone)", "memory")
            pr = vlayer.dataProvider()
            f = QgsFeature()
            f.setGeometry(QgsGeometry.fromPointXY(QgsPointXY(lon_deg_res, lat_deg_res)))
            pr.addFeatures([f])
            vlayer.updateExtents()
            QgsProject.instance().addMapLayer(vlayer)
            
            self.iface.mapCanvas().setExtent(vlayer.extent())
            self.iface.mapCanvas().refresh()
            
            QMessageBox.information(self.iface.mainWindow(), "Success", 
                f"Centroid: Lon {lon_deg_res:.4f}, Lat {lat_deg_res:.4f}")
        except Exception as e:
            QMessageBox.critical(self.iface.mainWindow(), "Error", str(e))
