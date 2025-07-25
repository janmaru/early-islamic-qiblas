import React, { Component } from 'react';
import ReactTable from "react-table";

import Pagination from "../../helpers/Pagination";

import "react-table/react-table.css";
import "../../assets/css/Table.css";

export class MosqueList extends Component {
    static displayName = MosqueList.name;

    constructor(props) {
        super(props);
        this.state = { mosques: [], loading: true }; 
    }

    componentDidMount() {
        fetch('api/v1/mosque/list', {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                this.setState({ mosques: data, loading: false });
            });
    }

    static render(mosques) {
        return (
            <ReactTable
                PaginationComponent={Pagination}
                defaultPageSize={10} 
                data={mosques}
                columns={[ 
                    {
                        Header: "Age Group",
                        accessor: "ageGroup",
                        minWidth: 100
                    },
                    {
                        Header: "Year CE",
                        accessor: "yearCE",
                        minWidth: 100
                    },
                    {
                        Header: "Country",
                        accessor: "country",
                        minWidth: 100
                    },
                    {
                        Header: "City",
                        accessor: "city",
                        minWidth: 100
                    },
                    {
                        Header: "Name",
                        accessor: "mosqueName",
                        minWidth: 100,
                        Cell: (row) => {
                            const name = row.value;
                            const link = row.original.moreInfo;
                            return link && link !== "#" ? (
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                    {name}
                                </a>
                            ) : (
                                name
                            );
                        }
                    }
                ]}
            />
        );
    }


    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : MosqueList.render(this.state.mosques);

        return (
            <div>
                <h1>Mosques</h1>
                {contents}
            </div>
        );
    }
}
