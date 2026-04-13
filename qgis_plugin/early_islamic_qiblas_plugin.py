import os
import json
import math
from qgis.core import (QgsVectorLayer, QgsProject, QgsFeature, QgsGeometry,
    QgsPointXY, QgsField, QgsRasterMarkerSymbolLayer, QgsSymbol, QgsSingleSymbolRenderer,
    QgsPointClusterRenderer, QgsSimpleMarkerSymbolLayer, QgsFontMarkerSymbolLayer, QgsAction, Qgis,
    QgsProperty, QgsSymbolLayer)
from qgis.PyQt.QtCore import Qt, QVariant, QPointF
from qgis.PyQt.QtGui import QIcon, QColor, QFont
from qgis.PyQt.QtWidgets import QAction as QgsQtAction
from qgis.PyQt.QtWidgets import QMessageBox, QDialog, QVBoxLayout, QPushButton, QLabel

class EarlyIslamicQiblasPlugin:
    def __init__(self, iface):
        self.iface = iface
        self.plugin_dir = os.path.dirname(__file__)
        self.action = None
        self.dialog = None
        self.mosques_file = os.path.normpath(os.path.join(self.plugin_dir, "assets", "mosques.json"))
        self.icon_path = os.path.normpath(os.path.join(self.plugin_dir, "assets", "icon.png"))

    def initGui(self):
        icon = QIcon(self.icon_path)
        self.action = QgsQtAction(icon, "Early Islamic Qiblas", self.iface.mainWindow())
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
        with open(self.mosques_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def load_mosques(self):
        try:
            mosques = self.load_data()
            vlayer = QgsVectorLayer("Point?crs=EPSG:4326", "Mosques (Standalone)", "memory")
            pr = vlayer.dataProvider()
            
            pr.addAttributes([
                QgsField("title", QVariant.String),
                QgsField("city", QVariant.String),
                QgsField("country", QVariant.String),
                QgsField("age_group", QVariant.String),
                QgsField("year_ce", QVariant.String),
                QgsField("year_ah", QVariant.String),
                QgsField("rebuilt", QVariant.String),
                QgsField("more_info_url", QVariant.String),
            ])
            vlayer.updateFields()

            qgs_features = []
            for m in mosques:
                lon, lat = m.get('Lon'), m.get('Lat')
                if lon is None or lat is None: continue

                q_feat = QgsFeature()
                q_feat.setGeometry(QgsGeometry.fromPointXY(QgsPointXY(float(lon), float(lat))))
                # Attribute order must match addAttributes() above: title, city,
                # country, age_group, year_ce, year_ah, rebuilt, more_info_url.
                q_feat.setAttributes([
                    str(m.get('MosqueName', 'Unknown')),
                    str(m.get('City', '') or ''),
                    str(m.get('Country', '') or ''),
                    str(m.get('AgeGroup', '') or ''),
                    str(m.get('YearCE', '') or ''),
                    str(m.get('YearAH', '') or ''),
                    str(m.get('Rebuilt', '') or ''),
                    str(m.get('MoreInfo', '') or ''),
                ])
                qgs_features.append(q_feat)
            
            pr.addFeatures(qgs_features)
            vlayer.updateExtents()

            # --- Symbology (Proportional Clustering) ---
            base_symbol = QgsSymbol.defaultSymbol(vlayer.geometryType())
            if os.path.exists(self.icon_path):
                symbol_layer = QgsRasterMarkerSymbolLayer(self.icon_path)
                symbol_layer.setSize(6.0)
                base_symbol.changeSymbolLayer(0, symbol_layer)

            cluster_symbol = QgsSymbol.defaultSymbol(vlayer.geometryType())
            
            # Circle layer
            circle_layer = QgsSimpleMarkerSymbolLayer()
            circle_layer.setShape(QgsSimpleMarkerSymbolLayer.Circle)
            circle_layer.setStrokeColor(QColor("#FFFFFF"))
            circle_layer.setStrokeWidth(0.5)
            
            size_expr = "CASE WHEN @cluster_size < 33 THEN 6 WHEN @cluster_size < 75 THEN 9 ELSE 12 END"
            circle_layer.setDataDefinedProperty(QgsSymbolLayer.PropertySize, QgsProperty.fromExpression(size_expr))
            color_expr = "CASE WHEN @cluster_size < 33 THEN '#3F5D5F' WHEN @cluster_size < 75 THEN '#3278AB' ELSE '#92AE8A' END"
            circle_layer.setDataDefinedProperty(QgsSymbolLayer.PropertyFillColor, QgsProperty.fromExpression(color_expr))
            cluster_symbol.changeSymbolLayer(0, circle_layer)
            
            # Count text layer: bind character to @cluster_size so the cluster
            # renders the number of features, not a literal character.
            font_layer = QgsFontMarkerSymbolLayer()
            font_layer.setFontFamily("Arial")
            font_layer.setCharacter("")
            font_layer.setDataDefinedProperty(
                QgsSymbolLayer.PropertyCharacter,
                QgsProperty.fromExpression("@cluster_size")
            )
            font_layer.setColor(QColor("#FFFFFF"))
            font_layer.setSize(3.0)
            font_layer.setOffset(QPointF(0, 0))
            cluster_symbol.appendSymbolLayer(font_layer)

            renderer = QgsPointClusterRenderer()
            renderer.setEmbeddedRenderer(QgsSingleSymbolRenderer(base_symbol))
            renderer.setClusterSymbol(cluster_symbol)
            renderer.setTolerance(25)
            renderer.setToleranceUnit(Qgis.RenderUnit.Pixels) 
            
            vlayer.setRenderer(renderer)
            # HTML presentation built in the map tip template so stored
            # attributes stay clean. Single-quoted Python strings let us use
            # QGIS double-quoted field references without escaping.
            map_tip = (
                '<h3>[% "title" %]</h3>'
                '<table style="width:100%; border:0;">'
                '<tr><td><b>City:</b></td><td>[% "city" %]</td></tr>'
                '<tr><td><b>Country:</b></td><td>[% "country" %]</td></tr>'
                '<tr><td><b>Age Group:</b></td><td>[% "age_group" %]</td></tr>'
                '<tr><td><b>Year CE:</b></td><td>[% "year_ce" %]</td></tr>'
                '<tr><td><b>Year AH:</b></td><td>[% "year_ah" %]</td></tr>'
                '<tr><td><b>Rebuilt:</b></td><td>[% "rebuilt" %]</td></tr>'
                '</table>'
            )
            vlayer.setMapTipTemplate(map_tip)

            # --- Actions ---
            # OpenUrl avoids code injection: the URL is opened directly by QGIS,
            # not interpolated into Python source executed at click time.
            vlayer.actions().addAction(QgsAction.OpenUrl, "Open More Info",
                '[% "more_info_url" %]', True)

            QgsProject.instance().addMapLayer(vlayer)
            QMessageBox.information(self.iface.mainWindow(), "Success", "Mosques loaded.")
        except Exception as e:
            QMessageBox.critical(self.iface.mainWindow(), "Error", str(e))

    def calculate_centroid(self):
        try:
            mosques = self.load_data()
            sum_x = sum_y = sum_z = 0.0
            count = 0
            for m in mosques:
                lon_deg, lat_deg = m.get('Lon'), m.get('Lat')
                if lon_deg is None or lat_deg is None: continue
                lon, lat = math.radians(float(lon_deg)), math.radians(float(lat_deg))
                sum_x += math.cos(lat) * math.cos(lon)
                sum_y += math.cos(lat) * math.sin(lon)
                sum_z += math.sin(lat)
                count += 1
            if count == 0: return
            avg_x, avg_y, avg_z = sum_x/count, sum_y/count, sum_z/count
            lon_res, lat_res = math.atan2(avg_y, avg_x), math.atan2(avg_z, math.sqrt(avg_x**2 + avg_y**2))
            vlayer = QgsVectorLayer("Point?crs=EPSG:4326", "Centroid (Standalone)", "memory")
            pr = vlayer.dataProvider()
            f = QgsFeature()
            f.setGeometry(QgsGeometry.fromPointXY(QgsPointXY(math.degrees(lon_res), math.degrees(lat_res))))
            pr.addFeatures([f])
            QgsProject.instance().addMapLayer(vlayer)
            self.iface.mapCanvas().setExtent(vlayer.extent())
            self.iface.mapCanvas().refresh()
        except Exception as e:
            QMessageBox.critical(self.iface.mainWindow(), "Error", str(e))
