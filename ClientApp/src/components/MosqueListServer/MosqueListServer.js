import React from 'react';
import ReactTable from "react-table"; 
import "react-table/react-table.css";
 

export class MosqueListServer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: true,
            pages: 0
        };
        this.fetchData = this.fetchData.bind(this);
    }
 
    fetchData(state, instance) { 
        fetch('api/v1/mosque/pagedlist?pagesize=' + state.pageSize + '&page=' + state.page + "&sorted=" + JSON.stringify(state.sorted) + "&filtered=" + JSON.stringify(state.filtered))
            .then(response => response.json())
            .then(data => {
                this.setState({ mosques: data.rows, loading: false, pages: data.pages });
            }); 
    }

    render() {
        const { mosques, pages, loading } = this.state;
        return (
            <ReactTable
                manual // Forces table not to paginate or sort automatically, so we can handle it server-side
                data={mosques}
                //showPagination={true}
                pages={pages} // Display the total number of pages
                defaultPageSize={10} 
                columns={[
                    {
                        Header: "Classification",
                        accessor: "gibsonClassification",
                        minWidth: 100
                    },
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
                        minWidth: 100
                    }
                ]}
                loading={loading} // Display the loading overlay when we need it
                className="-striped -highlight"
                onFetchData={this.fetchData} // Request new data when things change 
            /> 
        );
    }
}