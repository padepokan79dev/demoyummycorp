import React from "react";
import { Row, Col, Table, Pagination } from "antd";

class Datatable extends React.Component {
    constructor(props) {
        super(props);  
        this.state = {};
    }

    render() {
        return(
            <>
                <Table
                    columns={this.props.column}
                    dataSource={this.props.dataSource}
                    loading={this.props.loading}
                    size="middle"
                    style={this.props.styleTable}
                    pagination={false}
                />
                <Row style={{ marginTop: '20px' }}>
                    <Col span={24} style={{ textAlign: 'right' }}>
                        <Pagination
                            total={this.props.totalData}
                            size='small'
                            pageSize={this.props.pageSize}
                            onChange={this.props.pageHandler}
                        />
                    </Col>
                </Row> 
            </>
        );
    }
}

export default Datatable;