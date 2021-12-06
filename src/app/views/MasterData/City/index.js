import React from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, Typography, Row, Col, Button, Input, Card, Space, notification, Popconfirm, Table } from 'antd';
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled } from '@ant-design/icons';
import Modal from './modal';
import { FSMServices } from '../../../service';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../../global/function';
import PermissionDenied from '../../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title } = Typography;

class City extends React.Component {
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
      cityList: [],
      sort: 'city_id,asc',
      search: '',
      pagination: {
        current: 1,
        pageSize: 10,
      },
      optionRegion:[
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
      accessRight: ''
    }
  }

  componentDidMount() {
    this.setState({
      userIdAkun: this.props.userId
    })

    this.getCityList(
      this.state.pagination.current - 1,
      this.state.pagination.pageSize,
      this.state.sort,
      this.state.search
    )

    this.optionProvince()
    setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
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
    if ( sorter.order === "ascend" ) {
      sorter.order = !this.state.isSearching ? "asc" : null;
    } else if (sorter.order === "descend" ) {
      sorter.order = "desc";
    }

    this.setState({
      sort: `${sorter.order ? `${sorter.columnKey},${sorter.order}` : 'city_id,asc'}`,
      pagination: pagination
    }, () => {
      this.getCityList(
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
  },500)

  async getCityList(page, size, sort, search) {
    this.setState({ loading: true })
    let listTemp = []

    await FSMServices.getCityList(page, size, sort, search)
      .then(res => {
        listTemp = res && res.data && res.data.Data ? res.data.Data : [];
        this.setState({
          pagination: {
            ...this.state.pagination,
            total: res && res.data && res.data.totalListCity ? res.data.totalListCity : 0
	        }
        });
      })

    this.setState({
      cityList: listTemp.map(item => {
        return {
          ...item,
          key: item.cityId,
          provinceName: item.provinceId ? item.provinceId.provinceName : "-"
        }
      }),
      loading: false
    })
  }

  searchHandler = (e) => {
    if (e !== null) {
      let key = e.target.value;
      this.processSearchCity(key)
    } else {
      this.getCityList(
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort,
        this.state.search
      )
    }
  }

  processSearchCity = _debounce((key) => {
    this.setState({
      search: GlobalFunction.searchEncode(key),
      pagination: {
        ...this.state.pagination,
        current: 1
      }
    }, () => {
      this.getCityList(
        this.state.pagination.current - 1,
        this.state.pagination.pageSize,
        this.state.sort,
        this.state.search
      )
    });
  }, 500)

  createCityList = values => {
    this.setState({loadingCreateUpdate: true})
    const data = {
      provinceId: {
        provinceId: values.provinceId
      },
      cityName: values.cityName,
      region: values.region,
      createdBy: this.state.userIdAkun,
      lastModifiedBy: this.state.userIdAkun,
    }

    FSMServices.createCityList(data).then(res => {
      if (
            res &&
            res.status &&
            res.data.Status ?
              res.status === 200 &&
              res.data.Status === "OK" : false
      ) {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description: 'Create City Success'
        });
        this.handleModalCreate();
        this.setState({
          pagination:{
            ...this.state.pagination,
		        current: 1,
            loadingCreateUpdate: false
          }
        });
        this.getCityList(
          this.state.pagination.current - 1,
          this.state.pagination.pageSize,
          this.state.sort,
          this.state.search
        )
      } else {
        this.setState({ loadingCreateUpdate: false })
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description:
            res &&
            res.data &&
            res.data.Message ?
              res.data.Message :'Create City Failed'
        })
      }
    });
  }

  editCityList = values => {
    this.setState({loadingCreateUpdate: true})
    const data = {
      provinceId: {
          provinceId: values.provinceId
      },
      cityName: values.cityName,
      region: values.region,
      lastModifiedBy: this.state.userIdAkun
    }

    FSMServices.editCityList(values.cityId, data).then(res => {
      if (
            res &&
            res.status &&
            res.data.Status ?
              res.status === 200 &&
              res.data.Status === "OK" : false
      ) {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description: 'Edit City Success'
        })
        this.handleModalUpdate();
        this.setState({
           pagination:{
					   ...this.state.pagination,
					   current: 1
				   },
           loadingCreateUpdate: false
		    });
        this.getCityList(
          this.state.pagination.current - 1,
          this.state.pagination.pageSize,
          this.state.sort,
          this.state.search
        )
      } else {
        this.setState({ loadingCreateUpdate: false })
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description:
            res &&
            res.data &&
            res.data.Message ?
              res.data.Message :'Edit City Failed'
        })
      }
    })
  }

  deleteCityList = id => {
    let loading = this.state.loadingDelete
    loading[id] = true
    let body = {
      "lastModifiedBy": Cookies.get('userId')
    }
    this.setState({ loadingDelete: loading })

    FSMServices.deleteCityList(id, body).then(res => {
      if (
            res &&
            res.status &&
            res.data.Status ?
              res.status === 200 &&
              res.data.Status === "OK" : false
      ) {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description: 'Delete City Success'
        })
        this.setState({
				  pagination:{
					  ...this.state.pagination,
					  current: 1
				  }
			  });
        this.getCityList(
          this.state.pagination.current - 1,
          this.state.pagination.pageSize,
          this.state.sort,
          this.state.search
        )
      } else {
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description:
            res &&
            res.data &&
            res.data.Message ?
              res.data.Message :'Delete City Error',
          })
      }
    })

    loading[id] = false
    this.setState({ loadingDelete: loading })
  }

  render() {
    const { loading, cityList, pagination, accessRight, loadingCreateUpdate } = this.state
    const paginationCus = { ...pagination, showSizeChanger: false }
    const columns = [
      {
        width: 1,
        render: (record) => (
          <Popconfirm
            title="Are you sure?"
            okText="Yes"
            cancelText="No"
            onConfirm={ () => this.deleteCityList(record.cityId) }
          >
            { (accessRight.includes('Delete')) ?
              <Button
                className="btn-delete"
                type="danger"
                icon={<CloseOutlined />}
                size={'middle'}
                loading={this.state.loadingDelete[record.cityId]}
              />
              :<></>
            }
          </Popconfirm>
        )
      },
      {
        title: 'ID',
        dataIndex: 'cityId',
        key: 'city_id',
        sorter: true,
      },
      {
        title: 'City Name',
        dataIndex: 'cityName',
        key: 'city_name',
        sorter: true,
      },
      {
        title: 'Province Name',
        dataIndex: 'provinceName',
        key: 'p.province_name',
        sorter: true,
      },
      {
        title: 'Region',
        dataIndex: 'region',
        key: 'region',
        sorter: true,
      },
      {
        width: 1,
        onCell: (record) => {
          return { onClick: () => this.handleModalUpdate(record) }
        },
        render: () => (
          <div>
            { (accessRight.includes('Update')) ?
              <Button className="btn-edit" icon={<EditFilled />} size={'middle'} />
              :<></>
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
                    City
                  </Title>
                  { (accessRight.includes('Create')) ?
                    <Button
                      className="button-create"
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={this.handleModalCreate}
                    >
                      CREATE
                    </Button>
                    :<></>
                  }
                  <Modal
                    title="Update City"
                    visible={this.state.visibleUpdate}
                    buttonCancel={this.handleModalUpdate}
                    datarow={this.state.datarow}
                    onFinish={values => this.editCityList(values)}
                    optionProvince={this.state.optionProvince}
                    optionRegion={this.state.optionRegion}
                    searchProvince={val => this.searchProvince(val)}
                    loading={loadingCreateUpdate}
                  />
                  <Modal
                    title="New City"
                    visible={this.state.visibleCreate}
                    buttonCancel={this.handleModalCreate}
                    onFinish={values => this.createCityList(values)}
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
                  onChange={ e => this.searchHandler(e) }
                  style={{
                      width: '250px',
                      maxWidth: '80%',
                      marginRight: '10px'
                  }}
                  prefix={<SearchOutlined />}
                />
              </Col>
            </Row>
            <Row style={{marginBottom: 10}}>
              <Col span={24}>
                  <Card
                    bordered={false}
                    className="card-master-data"
                  >
                    <Table
                      onChange={this.handleTableChange}
                      columns={columns}
                      dataSource={cityList}
                      loading={loading}
                      pagination={paginationCus}
                      size="middle"
                    />
                  </Card>
              </Col>
            </Row>
          </div>
          :
          <PermissionDenied />
        }
      </Content>
    )
  }
}

export default withRouter(City);
