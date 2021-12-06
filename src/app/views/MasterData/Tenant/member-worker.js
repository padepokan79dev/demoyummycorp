import React from 'react'
import { Row, Col, Input, Table, Spin, Space, Button } from 'antd'
import _debounce from 'lodash.debounce'
import { SearchOutlined } from '@ant-design/icons';
import { FSMServices } from '../../../service';
import { GlobalFunction } from '../../../global/function';
import Cookies from 'js-cookie'

let membersByPage = [];

class MemberWorker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      sort: '',
      search: '',
      pagination: {
        current: 1,
        pageSize: 5,
      },
      sort: "tenant_id,asc",
      accessRight: ''
    }
  }

  componentDidMount() {
    if (this.props.refresh) {
      console.log('Refresh');
      this.getWorkerList(
        '',
        0,
        this.state.pagination.pageSize,
        this.state.sort
      );
      this.props.setRefresh(false);
    }
    this.getWorkerList(
      this.state.search,
      this.state.pagination.current - 1,
      this.state.pagination.pageSize,
      this.state.sort
    );
    setTimeout(() => this.setState({ accessRight: sessionStorage.getItem("accessRight") }), 500);
  }

  async getWorkerList(search, page, size, sort) {
    this.setState({
      loading: true
    });
    let listTemp = [];
    await FSMServices[this.props.isDetail ? 'getListUserDetailOnTenant' : 'getListUserAddMemberOnTenant'](search, page, size, sort, 'worker', this.props.tenantId)
      .then(res => {
        if (res && res.data && res.data.items) {
          res.data.items.map(item => {
            // if (item.userId.toString() !== Cookies.get('userId')) {
              listTemp.push(item);
            // }
          })
        }
        this.setState({
          pagination: {
            ...this.state.pagination,
            total:
              res &&
                res.data &&
                res.data.totalItems ?
                res.data.totalItems : []
          }
        });
      });
    this.setState({
      workerList: listTemp.map(item => {
        return {
          ...item,
          key: item.userId
        }
      })
    }, async () => {
      let listMember = [];
      if (Array.isArray(membersByPage[this.state.pagination.current - 1])) {
        listMember = membersByPage[this.state.pagination.current - 1]
      }
      await listTemp.map(item => {
        if (item.tenantId) {
          listMember.push(item.userId)
        }
      })
      membersByPage[this.state.pagination.current - 1] && membersByPage[this.state.pagination.current - 1].map(item => {
        if (listMember.indexOf(item) === -1) {
          listMember.push(item)
        }
      })
      GlobalFunction.getUnique(listMember)
      this.setState({
        selectedRowKeys: listMember,
        loading: false
      })
    });
  }

  searchHandler = (e) => {
    if (e !== null) {
      let key = e.target.value;
      this.processSearchUser(key)
    } else {
      this.getWorkerList(
        this.state.search,
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort
      );
    }
  }

  processSearchUser = _debounce((key) => {
    this.setState({
      search: GlobalFunction.searchEncode(key),
      pagination: {
        ...this.state.pagination,
        current: 1
      }
    }, () => {
      this.getWorkerList(
        this.state.search,
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort
      );
    });
  }, 500)

  handleTableChange = (pagination, search, sorter) => {
    membersByPage[this.state.pagination.current - 1] = this.state.selectedRowKeys;
    if (sorter.order === "ascend") {
      sorter.order = "asc";
    } else if (sorter.order === "descend") {
      sorter.order = "desc";
    }

    this.setState({
      sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'tenant_id,asc'}`,
      pagination: pagination
    }, () => {
      this.getWorkerList(
        this.state.search,
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort
      );
    });
  };

  onSelectChange = selectedRowKeys => {
    console.log('onSelect : ', selectedRowKeys)
    this.setState({ selectedRowKeys }, () => {
      membersByPage[this.state.pagination.current - 1] = this.state.selectedRowKeys;
    });
  };

  render() {
    const { pagination, selectedRowKeys, workerList, loading } = this.state;
    const rowSelection = !this.props.isDetail && {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const columnsWorker = [
      {
        title: 'Worker ID',
        dataIndex: 'userId',
        key: 'user_id',
        sorter: true,
      },
      {
        title: 'Email',
        dataIndex: 'userEmail',
        key: 'user_email',
        sorter: true,
      },
      {
        title: 'Name',
        dataIndex: 'userFullName',
        key: 'user_full_name',
        sorter: true,
      },
    ];

    const paginationCus = { ...pagination, showSizeChanger: false }
    console.log('Members : ', membersByPage);
    return (
      <div>
        <Spin spinning={loading}>
          <Row style={{ marginBottom: 15 }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Input
                className="input-search"
                placeholder="Search..."
                onChange={e => this.searchHandler(e)}
                style={{
                  width: '250px',
                  maxWidth: '80%',
                  marginRight: '10px',
                  border: '1px solid lightgray'
                }}
                prefix={<SearchOutlined />}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                rowSelection={rowSelection}
                columns={columnsWorker}
                dataSource={workerList}
                onChange={this.handleTableChange}
                pagination={paginationCus}
                size="middle"
              />
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right', marginTop: 40 }}>
              <Space size={'small'}>
                <Button
                  type="danger"
                  style={{
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    borderRadius: '5px'
                  }}
                  onClick={this.props.closeButton}
                >
                  Close
                </Button>
                {!this.props.isDetail &&
                  <Button
                    type="primary"
                    style={{
                      paddingLeft: '20px',
                      paddingRight: '20px',
                      borderRadius: '5px'
                    }}
                    onClick={() => this.props.onSave(membersByPage)}
                    loading={this.props.loading}
                  >
                    Save
                </Button>
                }
              </Space>
            </Col>
          </Row>
        </Spin>
      </div>
    )
  }
}

export default MemberWorker;
