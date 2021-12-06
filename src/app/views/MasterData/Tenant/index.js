import React from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Popconfirm, Table, Divider, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled, PlusCircleOutlined, EyeTwoTone } from '@ant-design/icons';
import ModalCreateEdit from './modal';
import { FSMServices } from '../../../service';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied';
import Cookies from 'js-cookie';
import MemberOfTenant from './member';

const { Content } = Layout;
const { Title } = Typography;

class Tenant extends React.Component {
  constructor(props) {
    super(props)
    document.title = `${this.props.name} | FSM`
    this.state = {
      visibleCreate: false,
      visibleUpdate: false,
      datarow: [],
      loading: true,
      loadingCreateUpdate: false,
      loadingDelete: [],
      tenantList: [],
      sort: 'tenant_name,asc',
      search: '',
      pagination: {
        current: 1,
        pageSize: 10,
      },
      optionRegion: [
        {
          region: "WIB"
        },
        {
          region: "WITA"
        },
        {
          region: "WIT"
        }
      ],
      optionProvince: [],
      accessRight: '',
      showMember: false
    }
  }

  componentDidMount() {
    this.setState({
      userIdAkun: this.props.userId
    })

    this.getTenantList(
      this.state.pagination.current - 1,
      this.state.pagination.pageSize,
      this.state.sort,
      this.state.search
    )

    this.optionProvince()
    setTimeout(() => this.setState({ accessRight: sessionStorage.getItem("accessRight") }), 500);
  }

  handleModalCreate = e => {
    this.setState({ visibleCreate: !this.state.visibleCreate })
  }

  handleModalUpdate = e => {
    this.setState({
      datarow: e,
      visibleUpdate: !this.state.visibleUpdate
    })
  }

  handleTableChange = (pagination, search, sorter) => {
    if (sorter.order === "ascend") {
      sorter.order = !this.state.isSearching ? "asc" : null;
    } else if (sorter.order === "descend") {
      sorter.order = "desc";
    }

    this.setState({
      sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'tenant_name,asc'}`,
      pagination: pagination
    }, () => {
      this.getTenantList(
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort,
        this.state.search
      );
    });
  };

  optionProvince() {
    FSMServices.getProvinceList('', '', 'province_name,asc', '')
      .then(res => {
        this.setState({
          optionProvince: res ? res.data.Data : []
        })
      })
  }

  searchProvince = (key) => {
    this.processSearchProvince(GlobalFunction.searchEncode(key))
  }

  processSearchProvince = _debounce(key => {
    const { optionProvince } = this.state
    let data = null
    FSMServices.getProvinceList('', '', 'province_name,asc', key).then(res => {
      data = res ? res.data.Data : optionProvince
      this.setState({
        optionProvince: data
      })
    })
  }, 500)

  async getTenantList(page, size, sort, search) {
    this.setState({ loading: true })
    let listTemp = []

    await FSMServices.getTenantList(page, size, sort, search)
      .then(res => {
        listTemp = res && res.data && res.data.items ? res.data.items : [];
        this.setState({
          pagination: {
            ...this.state.pagination,
            total: res && res.data && res.data.totalItems ? res.data.totalItems : 0
          }
        });
      })

    this.setState({
      tenantList: listTemp.map(item => {
        return {
          ...item,
          key: item.tenantId,
          tenantCode: item.tenantCode || null,
          tenantName: item.tenantName || null
        }
      }),
      loading: false
    })
  }

  searchHandler = (e) => {
    if (e !== null) {
      let key = e.target.value;
      this.processSearchTenant(key)
    } else {
      this.getTenantList(
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort,
        this.state.search
      )
    }
  }

  processSearchTenant = _debounce((key) => {
    this.setState({
      search: GlobalFunction.searchEncode(key),
      pagination: {
        ...this.state.pagination,
        current: 1
      }
    }, () => {
      this.getTenantList(
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort,
        this.state.search
      )
    });
  }, 500)

  createTenantList = values => {
    this.setState({loadingCreateUpdate:true})
    const data =
    {
      "userId": this.state.userIdAkun,
      "tenantCode": values.tenantCode,
      "tenantName": values.tenantName
    }

    FSMServices.createTenant(data).then(res => {
      if (res && res.status && res.status === 200 && res.data.Status === 'OK') {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description: 'Create Tenant Success'
        });
        this.handleModalCreate();
        this.setState({
          pagination: {
            ...this.state.pagination,
            current: 1
          },
          loadingCreateUpdate: false
        });
        this.getTenantList(
          this.state.pagination.current - 1,
          this.state.pagination.pageSize,
          this.state.sort,
          this.state.search
        )
      } else {
        this.setState({ loadingCreateUpdate: false })
        notification.error({
          placement: 'bottomRight',
          message: res.data && res.data.Status ? res.data.Status : 'Error',
          description:
            res &&
              res.data &&
              res.data.Message ?
              res.data.Message : 'Create Tenant Failed'
        })
      }
    });
  }

  updateTenantList = values => {
    this.setState({loadingCreateUpdate:true})
    const data = {
      "userId": this.state.userIdAkun,
      "tenantCode": values.tenantCode,
      "tenantName": values.tenantName
    }

    FSMServices.updateTenant(values.tenantId, data).then(res => {
      if (res && res.status && res.status === 200 && res.data.Status === 'OK') {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description: 'Edit Tenant Success'
        })
        this.handleModalUpdate();
        this.setState({
          pagination: {
            ...this.state.pagination,
            current: 1
          },
          loadingCreateUpdate: false
        });
        this.getTenantList(
          this.state.pagination.current - 1,
          this.state.pagination.pageSize,
          this.state.sort,
          this.state.search
        )
      } else {
        this.setState({ loadingCreateUpdate: false })
        notification.error({
          placement: 'bottomRight',
          message: res.data && res.data.Status ? res.data.Status : 'Error',
          description:
            res &&
              res.data &&
              res.data.Message ?
              res.data.Message : 'Edit Tenant Failed'
        })
      }
    })
  }

  deleteTenantList = id => {
    let loading = this.state.loadingDelete
    loading[id] = true
    this.setState({ loadingDelete: loading })

    FSMServices.deleteTenant(id).then(res => {
      if (res && res.status && res.status === 200 && res.data.Status === 'OK') {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description: 'Delete Tenant Success'
        })
        this.setState({
          pagination: {
            ...this.state.pagination,
            current: 1
          }
        });
        this.getTenantList(
          this.state.pagination.current - 1,
          this.state.pagination.pageSize,
          this.state.sort,
          this.state.search
        )
      } else {
        notification.error({
          placement: 'bottomRight',
          message: res.data && res.data.Status ? res.data.Status : 'Error',
          description:
            res &&
              res.data &&
              res.data.Message ?
              res.data.Message : 'Delete Tenant Error',
        })
      }
    })

    loading[id] = false
    this.setState({ loadingDelete: loading })
  }

  doShowMember = (tenantId, isDetail = false) => {
    this.setState({ showMember: true, tenantId, isDetail })
  }

  render() {
    const { loading, loadingCreateUpdate, tenantList, pagination, accessRight, tenantId, isDetail, showMember } = this.state
    const paginationCus = { ...pagination, showSizeChanger: false }
    const columns = [
      {
        width: 1,
        render: (record) => (
          <Popconfirm
            title="Are you sure?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => this.deleteTenantList(record.tenantId)}
          >
            {accessRight.includes('Delete') &&
              <Button
                className="btn-delete"
                type="danger"
                icon={<CloseOutlined />}
                size={'middle'}
                loading={this.state.loadingDelete[record.tenantId]}
              />
            }
          </Popconfirm>
        )
      },
      {
        title: 'Tenant Code',
        dataIndex: 'tenantCode',
        key: 'tenant_code',
        sorter: true,
      },
      {
        title: 'Tenant Name',
        dataIndex: 'tenantName',
        key: 'tenant_name',
        sorter: true,
      },
      {
        render: (record) => (
          <div>
            {accessRight.includes('Detail') &&
              <Button type="link" icon={<EyeTwoTone />} onClick={() => this.doShowMember(record.tenantId, true)}>{`Detail`}</Button>
            }
            <Divider type="vertical" />
            {accessRight.includes('Add Member') &&
              <Button style={{ color: 'green' }} type="link" icon={<PlusCircleOutlined />} onClick={() => this.doShowMember(record.tenantId)}>{`Add Member`}</Button>
            }
          </div>
        )
      },
      {
        width: 1,
        onCell: (record) => {
          return { onClick: () => this.handleModalUpdate(record) }
        },
        render: () => (
          <div>
            {accessRight.includes('Update') &&
              <Button className="btn-edit" icon={<EditFilled />} size={'middle'} />
            }
          </div>
        )
      }
    ]

    return (
      <Content className="content">
        { (accessRight.includes('Read')) || accessRight == "" ?
          <div>
            <Row style={{ marginBottom: '15px' }}>
              <Col md={12}>
                <Space size={20}>
                  <Title
                    level={2}
                    style={{
                      display: 'inline-block',
                      margin: '0'
                    }}
                  >
                    Tenant
                  </Title>
                  {(accessRight.includes('Create')) ?
                    <Button
                      className="button-create"
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={this.handleModalCreate}
                    >
                      CREATE
                    </Button>
                    : <></>
                  }
                  <ModalCreateEdit
                    title="Update Tenant"
                    visible={this.state.visibleUpdate}
                    buttonCancel={this.handleModalUpdate}
                    datarow={this.state.datarow}
                    onFinish={values => this.updateTenantList(values)}
                    optionProvince={this.state.optionProvince}
                    optionRegion={this.state.optionRegion}
                    searchProvince={val => this.searchProvince(val)}
                    loading={loadingCreateUpdate}
                  />
                  <ModalCreateEdit
                    title="New Tenant"
                    visible={this.state.visibleCreate}
                    buttonCancel={this.handleModalCreate}
                    onFinish={values => this.createTenantList(values)}
                    optionProvince={this.state.optionProvince}
                    optionRegion={this.state.optionRegion}
                    searchProvince={val => this.searchProvince(val)}
                    loading={loadingCreateUpdate}
                  />
                </Space>
              </Col>
              <Col md={12} style={{ textAlign: 'right' }}>
                <Input
                  className="input-search"
                  placeholder="Search..."
                  onChange={e => this.searchHandler(e)}
                  style={{
                    width: '250px',
                    maxWidth: '80%',
                    marginRight: '10px'
                  }}
                  prefix={<SearchOutlined />}
                />
              </Col>
            </Row>
            <Row style={{ marginBottom: 10 }}>
              <Col span={24}>
                <Card
                  bordered={false}
                  className="card-master-data"
                >
                  <Table
                    onChange={this.handleTableChange}
                    columns={columns}
                    dataSource={tenantList}
                    loading={loading}
                    pagination={paginationCus}
                    size="middle"
                  />
                </Card>
              </Col>
            </Row>
            <Modal
              visible={showMember}
              width="60%"
              footer={null}
              closable={false}
              centered
            >
              {showMember &&
                <MemberOfTenant
                  isDetail={isDetail}
                  tenantId={tenantId}
                  closeButton={() => this.setState({ showMember: false })}
                />
              }
            </Modal>
          </div>
          :
          <PermissionDenied />
        }
      </Content>
    )
  }
}

export default withRouter(Tenant);
