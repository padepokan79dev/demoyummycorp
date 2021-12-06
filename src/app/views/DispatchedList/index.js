import React from "react";
import { withRouter } from 'react-router-dom'
import { Layout, Row, Col, Table, Typography, Card, Input, Select, Avatar, Tag, Space, Popconfirm, Button, notification} from 'antd'
import { SearchOutlined, FilterFilled, LeftOutlined } from '@ant-design/icons'
import _debounce from 'lodash.debounce'
import { FSMServices } from '../../service'
import { GlobalFunction } from '../../global/function';
import Modal from '../Dashboard/modal'
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'
import ModalTicket from '../TicketingList/modal';

const { Content } = Layout;
const { Title, Text } = Typography;

class DispatchedList extends React.Component {
  constructor(props) {
    super(props)
    document.title = this.props.name + " | FSM"
    this.state = {
      search: '',
      filterBy: '',
      orderBy: 'created_on,desc',
      pagination: {
        defaultCurrent: 1,
        pageSize: 10
      },
      visibleDetailDispatch: false,
      visibleHold: false,
      loading: true,
      loadingHold: true,
      dispatchListFilter: [],
      detailTicketHold: [],
      detailDispatch: null,
      accessRight: '',
      dashboard: false,
      loadingReopen: [],
      loadingReopenDispatch: false,
      visibleReopen: false,
      loadingReopenTicket: false,
      idTicketReopen: null,
    }
  }

  componentDidMount() {
    this.getAccessDashboard()
    this.getDispatchList('',1, 10, 'created_on,desc');
    this.setState({
      userIdAkun: this.props.userId,
    })
    setTimeout(() => this.setState({accessRight: sessionStorage.getItem("accessRight")}),500);
  }

  getAccessDashboard(){
		var menu = JSON.parse(Cookies.get('menu'))
		for (var i = 0; i < menu.length; i++) {
			if (menu[i].name == 'Dashboard'){
				for (var j = 0; j < menu[i].accessRight.length; j++) {
					if (menu[i].accessRight[j] == 'Read'){
						this.setState({ dashboard: true })
						break
						break
					}
				}
			}
		}
	}

  async getDispatchList(keyword, page, size, sort) {
    let params = {
      keyword: keyword,
      page: page,
      size: size,
      sort: sort
    }
    this.setState({
      loading: true
    });
    let data = [];
    let totalDispatch = 0
    await FSMServices.getDispatchList(params)
    .then(res => {
      data = res ? res.data.Data : [];
      totalDispatch = res ? res.data.TotalData : 0;
      let temp = data.map( item => {
        return {
          key: item.ticketCode,
          order_id: item.orderId,
          ticket_id: item.ticketId,
          ticket_code: item.ticketCode,
          ticket_title: item.ticketTitle,
          worker_name: item.workerName,
          company_name: item.companyName,
          start_job: item.startJob && item.startJob !== "-" ? new Date(item.startJob).toLocaleDateString() : "-",
          resolution_time: item.resolutionTime,
          dispatch_status: item.dispatchStatus,
          reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
          reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
        }
      })
      this.setState({
        dispatchListFilter: temp,
        pagination: {
          current: page,
          total: totalDispatch
        },
        totalDispatch: data.length,
        loading: false
        });
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { search, filterBy } = this.state
    let sorterField = ""
    if( sorter.field === "ticket_code" ){
    sorterField = "b.ticket_code";
    }else if ( sorter.field === "ticket_title" ) {
    sorterField = "b.ticket_title";
    }else if ( sorter.field === "company_name" ) {
      sorterField = "d.company_name";
    }else if ( sorter.field === "worker_name" ) {
      sorterField = "e.user_full_name";
    } else if ( sorter.field === "resolution_time" ) {
      sorterField = "f.sla_resolution_time";
    }else if ( sorter.field === "dispatch_status" ) {
      sorterField = "g.dispatch_status";
    } else {
      sorterField = sorter.field;
    }
    let orderBy = "created_on,desc";
    if (sorter.order === "ascend" ) {
      orderBy = `${sorterField},asc`;
    } else if (sorter.order === "descend") {
      orderBy = `${sorterField},desc`;
    }
    this.setState({
      orderBy: orderBy
    }, () => {
      if (filterBy === 'lucy' || filterBy === ''){
        this.getDispatchList(search, pagination.current, pagination.pageSize, orderBy)
      }else {
        this.getTicketListSearchStatus(filterBy, search, pagination.current, pagination.pageSize, orderBy)
      }
    })
  }

  onChangeStatus = (e) => {
    const {search, orderBy} = this.state
    this.setState({
      filterBy : e
    }, () => {
      if (e === 'lucy') {
        this.getDispatchList(search, 1, 10, orderBy)
      }else {
        this.getTicketListSearchStatus(e, search, 1, 10, orderBy)
      }
    })
  }

  searchDispatch(value){
    let key = value.target.value
    this.processSearchDispatch(GlobalFunction.searchEncode(key))
  }

  processSearchDispatch = _debounce(key => {
    const {filterBy, orderBy} = this.state
    this.setState({
      search: key,
    }, () => {
        if (filterBy === 'lucy' || filterBy === '') {
            this.getDispatchList(this.state.search, 1, 10, orderBy)
        }else {
            this.getTicketListSearchStatus(filterBy, key, 1, 10, orderBy)
        }
    })
  },500 )

  getTicketListSearchStatus = ( filter, keyword, page, size, order) => {
    let params = {
      filter: filter,
      keyword: keyword,
      page: page,
      size: size,
      sort: order
    }
    this.setState({
      loading: true,
    })
    let data = [];
    let totalDispatch = 0
    FSMServices.getDispatchListFilterSearch(params)
    .then(res => {
      data = res ? res.data.Data : [];
      totalDispatch = res ? res.data.TotalData : 0;
      let temp = data.map( item => {
        return {
          key: item.ticketCode,
          order_id: item.orderId,
          ticket_id: item.ticketId,
          ticket_code: item.ticketCode,
          ticket_title: item.ticketTitle,
          worker_name: item.workerName,
          company_name: item.companyName,
          start_job: item.startJob && item.startJob !== "-" ? new Date(item.startJob).toLocaleDateString() : "-",
          resolution_time: item.resolutionTime,
          dispatch_status: item.dispatchStatus,
          reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
          reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
        }
      })
      this.setState({
        dispatchListFilter: temp,
        pagination: {
          current: page,
          total: totalDispatch
        },
        totalDispatch: data.length,
        loading: false
        });
    });
  }

  handleModalHold = (id) => {
    this.setState({
      loadingHold: true,
      visibleHold: true
    })
    let data = []
    FSMServices.getHoldTicketId(id)
    .then(res => {
      data = res ? res.data.Data : []
      this.setState({
        detailTicketHold: data,
        loadingHold: false
      })
    })
  }

  handleModalHoldClose = () => {
    this.setState({
      visibleHold: false
    })
  }

  handleModalDetailDispatch = orderId => {
    this.setState({
      visibleDetailDispatch: !this.state.visibleDetailDispatch,
      loadingDetailDispatch: true
    });
    FSMServices.getDetailDispatch(orderId).then(res => {
      this.setState({
        detailDispatch: res ? res.data.Data : [],
        loadingDetailDispatch: false
      });
    });
  }

  handleModalDetailDispatchClose = () => {
    this.setState({
      visibleDetailDispatch: false
    })
  }

  reopenTicket = async (record) => {
    let { loadingReopen, search, filterBy, orderBy } = this.state;
    loadingReopen[record.ticket_id] = true;
    this.setState({ loadingReopen });

    var data = {
      createdBy: Cookies.get('userId'),
    }

    await FSMServices.reopenTicket(record.ticket_id, data)
    .then(res => {
      if (
        res &&
        res.data &&
        res.data.Status ?
        res.data.Status === "OK" : false
      ) {
        notification.success({
          placement: 'bottomRight',
          message: 'Success',
          description:
            res &&
            res.data &&
            res.data.Message ?
            res.data.Message : "Reopen Ticket Success",
        });
        if (filterBy === 'lucy' || filterBy === '') {
            this.getDispatchList(search, 1, 10, orderBy)
        }else {
            this.getTicketListSearchStatus(filterBy, search, 1, 10, orderBy)
        }
      } else {
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description:
            res &&
            res.data &&
            res.data.Message ?
            res.data.Message : "Reopen Ticket Error"
        });
      }
    })

    loadingReopen[record.ticket_id] = false;
    this.setState({ loadingReopen });
  }

  handleReopenTicketModal = (id) => {
      this.setState({
          visibleReopen: !this.state.visibleReopen,
          idTicketReopen: id
      })
  }

  handleReopenTicket = async value => {
      const { idTicketReopen, search, filterBy, orderBy} = this.state
      this.setState({
          loadingReopenTicket: true
      })
      let data = {
          reason: value.reasonCancel,
          createdBy: Cookies.get('userId')
      }

      await FSMServices.reopenTicketDispatch(idTicketReopen, data).then( res => {
          if (
            res &&
            res.data &&
            res.data.Status ?
            res.data.Status === "OK" : false
          ) {
            notification.success({
              placement: 'bottomRight',
              message: 'Success',
              description:
                res &&
                res.data &&
                res.data.Message ?
                res.data.Message : "Reopen Ticket Success",
            });
            if (filterBy === 'lucy' || filterBy === '') {
                this.getDispatchList(search, 1, 10, orderBy)
            }else {
                this.getTicketListSearchStatus(filterBy, search, 1, 10, orderBy)
            }
          } else {
            notification.error({
              placement: 'bottomRight',
              message: 'Error',
              description:
                res &&
                res.data &&
                res.data.Message ?
                res.data.Message : "Reopen Ticket Error"
            });
          }
      })

      this.setState({
          loadingReopenTicket: false,
          visibleReopen: false
      });
  }

  render() {
    const { loading, dispatchListFilter, pagination, accessRight, dashboard } = this.state
    let paginationCus = { ...pagination, showSizeChanger: false}
    let columns = [
      {
        title: "Ticket ID",
        dataIndex: "ticket_code",
        key: "b.ticket_code",
        sorter: true,
        render: (ticketCode, record) => {
          return (
            <Text
              className="text-detail"
              onClick={e => this.handleModalDetailDispatch(record.order_id)}
            >
              {record.ticket_code}
            </Text>
          )
        },
      },
      {
          title: 'Ref. Ticket ID',
          dataIndex: 'reference_ticket_code',
          key: 'b.reference_ticket_code',
          sorter: true,
          render: reference_ticket_code => <Text style={{color: (reference_ticket_code != "-" ) ? 'blue' : 'black', cursor: (reference_ticket_code != "-" ) ? 'pointer' : ''}} >{reference_ticket_code}</Text>,
          onCell: record => {
              return{
                  onClick: () => {
                      this.handleModalDetailDispatch(record.reference_ticket.orderId)
                  }
              }
          },
          align: 'center'
      },
      {
        title: "Title",
        dataIndex: "ticket_title",
        key: "ticket_title",
        sorter: true,
      },
      {
        title: "Worker",
        dataIndex: "worker_name",
        key: "e.user_full_name",
        sorter: true,
      },
      {
        title: "Customer",
        dataIndex: "company_name",
        key: "d.company_name",
        sorter: true,
      },
      {
        title: "Start Job",
        dataIndex: "start_job",
        key: "a.start_job",
        sorter: true,
        align: "center"
      },
      {
        title: "Resolution Time",
        dataIndex: "resolution_time",
        key: "resolution_time",
        sorter: false,
        align: "center"
      },
      {
        title: "Status",
        dataIndex: "dispatch_status",
        key: "dispatch_status",
        sorter: true,
        render: (dispatch_status, record) => {
          if (dispatch_status.toLowerCase() === "dispatched") {
            return (
              <Tag color="blue">{dispatch_status}</Tag>
            )
          } else if (dispatch_status.toLowerCase() === "canceled") {
            return (
              <Tag color="red">{dispatch_status}</Tag>
            )
          }else if (dispatch_status.toLowerCase() === "confirmed") {
            return (
              <Tag color="green">{dispatch_status}</Tag>
            )
          } else if(dispatch_status.toLowerCase() === "hold") {
            return (
              <Tag color="orange" style={{cursor: 'pointer'}} onClick={() => this.handleModalHold(record.order_id)}>{dispatch_status}</Tag>
            )
          } else {
            return (
              <Tag >{dispatch_status}</Tag>
            )
          }
        },
        align: "center"
      },
      {
          width: 1,
          render: record => (
              <div>
                { (record.dispatch_status.toLowerCase() === 'canceled' && accessRight.includes('Re-Open')) ?
                    <Popconfirm
                      title="Are you sure?"
                      okText="Yes"
                      cancelText="No"
                      onConfirm={ () => this.reopenTicket(record) }
                    >
                      <Button
                       className="button-confirm"
                       type="primary"
                       style={{backgroundColor:'green', borderColor:'green'}}
                       loading={this.state.loadingReopen[record.ticket_id]}>
                         Re-Open
                      </Button>
                    </Popconfirm>
                  : ((record.dispatch_status.toLowerCase() === 'confirmed' || record.dispatch_status.toLowerCase() === 'reported') && accessRight.includes('Re-Open')) ?
                    <Button
                     className="button-confirm"
                     type="primary"
                     style={{backgroundColor:'green', borderColor:'green'}}
                     loading={this.state.loadingReopenTicket}
                     onClick={() => this.handleReopenTicketModal(record.ticket_id)}>
                       Re-Open
                    </Button>
                  : <></>
                }
              </div>
          ),
          align: 'center'
      },
    ]

    return (
      <Content className="content">
        { accessRight.includes('Read') || accessRight == "" ?
          <div>
            <Row style={{marginBottom: 15}}>
              <Col md={12}>
                <Space size={20}>
                  { (dashboard) ?
                      <Avatar size="large" style={{ backgroundColor: 'red', background: '#27737D', cursor: 'pointer' }} icon={<LeftOutlined />} onClick={() => this.props.history.push('/dashboard') } />
                    : <></>
                  }

                  <Title level={2} style={{display: 'inline-block',margin: '0'}}>
                    Dispatched List
                  </Title>
                  <Modal
                    title="Detail Dispatch"
                    visible={this.state.visibleDetailDispatch}
                    buttonCancel={() => this.handleModalDetailDispatchClose()}
                    detailDispatch={this.state.detailDispatch? this.state.detailDispatch: []}
                    loading={this.state.loadingDetailDispatch}
                  />
                  <Modal
                    title="On-Hold Reason"
                    detailTicketHold={this.state.detailTicketHold}
                    visible={this.state.visibleHold}
                    buttonCancel={() => this.handleModalHoldClose()}
                    loading={this.state.loadingHold}
                  ></Modal>
                  <ModalTicket
                      title="Reopen Ticket"
                      visible={this.state.visibleReopen}
                      buttonCancel={ () => this.handleReopenTicketModal(this.state.idTicketReopen)}
                      loadingReopenTicket={this.state.loadingReopenTicket}
                      onFinish={value => this.handleReopenTicket(value)}
                  >
                  </ModalTicket>
                </Space>
              </Col>
                <Col md={1}>
                  <FilterFilled className="icon-sort-filter" style={{ paddingRight: '5px'}} />
                </Col>
                <Col md={4}>
                  <Select className="select-dashboard select-ticketList" defaultValue="lucy" onChange={(e) => this.onChangeStatus(e)}>
                    <Select.Option value="lucy">Status Filter</Select.Option>
                    <Select.Option value="Confirmed" style={{color: 'green'}}>CONFIRMED</Select.Option>
                    <Select.Option value="Start" style={{color: 'blue'}}>START</Select.Option>
                    <Select.Option value="Finish" style={{color: 'yellow'}}>FINISH</Select.Option>
                    <Select.Option value="Hold" style={{color: 'orange'}}>HOLD</Select.Option>
                    <Select.Option value="Reported" style={{color: 'green'}}>REPORTED</Select.Option>
                    <Select.Option value="Canceled" style={{color: 'red'}}>CANCELED</Select.Option>
                    <Select.Option value="Confirm Reported" style={{color: "#d742f5"}}>CONFIRM REPORTED</Select.Option>
                  </Select>
                </Col>
                <Col md={7} style={{textAlign: 'right'}}>
                  <Input
                    className="input-search"
                    placeholder="Search.."
                    onChange={(e) => this.searchDispatch(e)}
                    style={{
                      // width: '250px',
                      maxWidth: '90%'
                  }}
                    prefix={<SearchOutlined />}
                    />
                </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Card className="card">
                  <Table
                    size="middle"
                    loading={loading}
                    columns={columns}
                    pagination={paginationCus}
                    dataSource={dispatchListFilter}
                    onChange={(paginationValue, filters, sorter) => this.handleTableChange(paginationValue, filters, sorter)}
                    // scroll={{x: 1100}}
                  />
                </Card>
              </Col>
            </Row>
          </div>
          : <PermissionDenied />
        }
      </Content>
    )
  }
}

export default withRouter(DispatchedList)
