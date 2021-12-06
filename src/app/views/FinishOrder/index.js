import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Typography, Row, Col, Card, Space, Avatar, Table, Rate, Input, Select, Popconfirm, Button, notification } from "antd";
import { LeftOutlined, SearchOutlined } from '@ant-design/icons';
import _debounce from 'lodash.debounce'
import Modal from '../Dashboard/modal';
import { GlobalFunction } from '../../global/function';
import { FSMServices }  from "../../service";
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'
import ModalTicket from '../TicketingList/modal';

const { Content } = Layout;
const { Title, Text } = Typography;

class FinishedOrder extends React.Component {
  constructor(props) {
    super(props)
    document.title = this.props.name + " | FSM"
    this.state = {
      loading: false,
      visibelFinishOrder: false,
      loadingDetailFinishOrder: true,
      detailFinishOrder: [],
      visibleDetailTOC: false,
			detailTicketCancel: null,
			loadingDetailTicketCancel: false,
      search: '',
      filterBy: '',
      pagination: {
        defaultCurrent: 1,
        pageSize: 10
      },
      orderBy: 'created_on,desc',
      tikcetFinished: [],
      accessRight: '',
      dashboard: false,
      loadingConfirm: [],
      userId: Cookies.get('userId'),
      loadingReopenDispatch: false,
      visibleReopen: false,
      loadingReopenTicket: false,
      idTicketReopen: null,
    }
  }
  componentDidMount() {
    this.getAccessDashboard()
    this.getTicketFinishedOrder('', 1, 10, this.state.orderBy)
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

  async getTicketFinishedOrder (search, page, size, order) {
    this.setState({
			loading: true
    });
    await FSMServices.getTicketOnFinish(search, page, size, order).then(res => {
      let data = res ? res.data.Data : []
      this.setState({
        tikcetFinished: data.map( item => {
          return {
            ticketId: item.ticketId,
            status: item.status,
            orderId: item.orderId,
						ticket_code: item.ticketCode,
						ticket_title: item.ticketTitle,
            company_name: item.companyName,
            worker_name: item.workerName,
            start_job: item.startJob ? new Date(item.startJob).toLocaleDateString() : "-",
            end_job: item.endJob ? new Date(item.endJob).toLocaleDateString() : "-",
            dispatch_report_rating: item.dispatchReportRating,
            keyRanting: item.dispatchReportRating + Math.floor(Math.random() * 100),
            reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
            reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
          }
        }),
        pagination: {
					current: page,
					total: res ? res.data.TotalData : 0
				}
      })
      this.setState({
				loading: false
			});
    })
  }

  async getTicketFinishedOrderFilter (search, filter, page, size, order) {
    this.setState({
			loading: true
    });
    await FSMServices.getTicketOnFinishFilter(search, filter, page, size, order).then(res => {
      let data = res ? res.data.Data : []
      this.setState({
        tikcetFinished: data.map( item => {
          return {
            orderId: item.orderId,
						ticket_code: item.ticketCode,
						ticket_title: item.ticketTitle,
            company_name: item.companyName,
            worker_name: item.workerName,
            start_job: item.startJob ? new Date(item.startJob).toLocaleDateString() : "-",
            end_job: item.endJob ? new Date(item.endJob).toLocaleDateString() : "-",
            dispatch_report_rating: item.dispatchReportRating,
            keyRanting: item.dispatchReportRating + Math.floor(Math.random() * 100),
            reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
            reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
          }
        }),
        pagination: {
					current: page,
					total: res ? res.data.TotalData : 0
				}
      })
      this.setState({
				loading: false
			});
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    let sorterField = ""
    if ( sorter.field === "company_name" ) {
      sorterField = "c.company_name";
    } else if ( sorter.field === "worker_name" ) {
      sorterField = "h.user_full_name";
    }else if ( sorter.field === "start_job" ) {
      sorterField = "d.start_job";
    }else if ( sorter.field === "end_job" ) {
      sorterField = "d.end_job";
    }else if ( sorter.field === "dispatch_report_rating" ) {
      sorterField = "g.dispatch_report_rating";
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
      if (this.state.filterBy === '') {
        this.getTicketFinishedOrder(this.state.search, pagination.current, pagination.pageSize, orderBy)
      }else {
        this.getTicketFinishedOrderFilter(this.state.search, this.state.filterBy, pagination.current, pagination.pageSize, orderBy)
      }
    });
  };

  searchFinish = (e, name) => {
    const {search} = this.state
    let key = ''
    if (name === 'keyword') {
      key = e.target.value
      this.processSearchFinish(GlobalFunction.searchEncode(key))
    }else{
      key = e
      this.setState({
        filterBy: e
      }, () => {
        this.handleFinishFilter(search, key)
      })
    }
  }

  processSearchFinish = _debounce(key => {
    const { filterBy, orderBy } = this.state
    this.setState({
      search: key,
    }, () => {
      if (filterBy === '') {
        this.getTicketFinishedOrder(key, 1, 10, orderBy)
      }else {
        this.getTicketFinishedOrderFilter(key, filterBy, 1, 10, orderBy)
      }
    })
  },500)
  handleFinishFilter = (search, filter) => {
    const {orderBy} = this.state
    if (filter === '') {
      this.getTicketFinishedOrder(search, 1, 10, orderBy)
    }else {
      this.getTicketFinishedOrderFilter(search, filter, 1, 10, orderBy)
    }
  }
  handleModalDetail = key => {
    this.setState({
      visibelFinishOrder: !this.state.visibelFinishOrder,
      loadingDetailFinishOrder: true,
      }, () => {
      FSMServices.getDetailFinishOrder(key).then(res => {
        if( typeof res.data.Data.value === 'object'){
        let temp = res.data.Data
        this.setState({
          detailFinishOrder : res ? temp: [],
          loadingDetailFinishOrder: false
        })
        }else if(( typeof res.data.Data.value === 'string')){
          let temp = res.data.Data
          temp.value = JSON.parse(res.data.Data.value)
          this.setState({
          detailFinishOrder : res ? temp: [],
          loadingDetailFinishOrder: false
        })
        }else {
          let temp = res.data.Data
          temp=''
          this.setState({
          detailFinishOrder : res ? temp: [],
          loadingDetailFinishOrder: false
        })
        }
      })
    })
  }

  handleModalDetailCancel = e => {
		this.setState({
			visibleDetailTOC: !this.state.visibleDetailTOC,
			loadingDetailTicketCancel: true,
		},() => {
			FSMServices.getDetailTicketCancel(e).then(res => {
        this.setState({
            detailTicketCancel: res ? res.data.Data : null,
            loadingDetailTicketCancel: false
				});
			})
		})
	}

  handleModalDetailFOClose = () => {
    this.setState({
      visibelFinishOrder: false
    })
  }

  handleModalDetailTOCClose = () => {
		this.setState({
			visibleDetailTOC: false
		})
	}

  confirmTicket = async (record) => {
		let { loadingConfirm, userId } = this.state;
		loadingConfirm[record.orderId] = true;
		this.setState({ loadingConfirm });

    var data = {
      lastModifiedBy: parseInt(userId),
      createdBy: parseInt(userId),
    }

    await FSMServices.confirmReport(record.ticketId, data)
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
						res.data.Message : "Confirm Report Success",
				});
				this.getTicketFinishedOrder('', 1, 10, this.state.orderBy)
        this.handleModalDetailFOClose()
			} else {
				notification.error({
					placement: 'bottomRight',
					message: 'Error',
					description:
						res &&
						res.data &&
						res.data.Message ?
						res.data.Message : "Confirm Report Error"
				});
			}
		})

    loadingConfirm[record.orderId] = false;
		this.setState({ loadingConfirm });
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
                this.getTicketFinishedOrder(search, 1, 10, orderBy)
            }else {
                this.getTicketFinishedOrderFilter(filterBy, search, 1, 10, orderBy)
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
    const { pagination, accessRight, dashboard } = this.state
    const columns =
      [
        {
          title: 'Ticket  ID',
          dataIndex: 'ticket_code',
          key: 'ticket_code',
          render: key => <Text style={{color: 'blue', cursor: 'pointer'}}>{key}</Text>,
          onCell: record => {
            return{
              onClick: () => {
                this.handleModalDetail(record.orderId)
              }
            }
        },
          sorter: true
        },
        {
            title: 'Ref. Ticket ID',
            dataIndex: 'reference_ticket_code',
            key: 'reference_ticket_code',
            sorter: true,
            render: reference_ticket_code => <Text style={{color: (reference_ticket_code != "-" ) ? 'blue' : 'black', cursor: (reference_ticket_code != "-" ) ? 'pointer' : ''}} >{reference_ticket_code}</Text>,
            onCell: record => {
                return{
                    onClick: () => {
                        (record.reference_ticket.ticketStatus.toLowerCase() != "cancel") ? this.handleModalDetail(record.reference_ticket.orderId) : this.handleModalDetailCancel(record.reference_ticket.ticketId)
                    }
                }
            },
            align: 'center'
        },
        {
          title: 'Title',
          dataIndex: 'ticket_title',
          key: 'ticket_title',
          sorter: true
        },
        {
          title: 'Customer',
          dataIndex: 'company_name',
          key: 'c.company_name',
          sorter: true
        },
        {
          title: 'Worker Name',
          dataIndex: 'worker_name',
          key: 'h.user_full_name',
          sorter: true
        },
        {
          title: 'Start job',
          dataIndex: 'start_job',
          key: 'd.start_job',
          sorter: true
        },
        {
          title: 'End Job',
          dataIndex: 'end_job',
          key: 'd.end_job',
          sorter: true
        },
        {
          title: 'Rating',
          width: 150,
          dataIndex: 'dispatch_report_rating',
          key: 'dispatch_report_rating',
          render: dispatch_report_rating => (
            <Rate allowHalf disabled value={dispatch_report_rating}/>
          ),
          sorter: true
        },
        {
          title: '',
          align: 'center',
          render: record => (
            <div>
							{ (accessRight.includes('Confirm Reported') && record.dispatch_report_rating > 0 && record.status != "Confirm Reported") ?
								<Popconfirm
									title="Are you sure?"
									okText="Yes"
									cancelText="No"
									onConfirm={ () => this.confirmTicket(record) }
								>
									<Button
									 className="button-confirm"
                   block
									 type="primary"
									 style={{borderRadius:"8px"}}
									 loading={this.state.loadingConfirm[record.orderId]}>
										 Confirm
									</Button>
								</Popconfirm>
							 	:<></>
						 }
             <div style={{margin:8}}></div>
             { (accessRight.includes('Re-Open') && record.dispatch_report_rating > 0 && record.status != "Confirm Reported") ?
               <Button
                className="button-confirm"
                block
                type="primary"
                style={{backgroundColor:'green', borderColor:'green', borderRadius:"8px"}}
                loading={this.state.loadingReopenTicket}
                onClick={() => this.handleReopenTicketModal(record.ticketId)}>
                  Re-Open
               </Button>
               :<></>
            }
						</div>
          )
        },
      ]

    let paginationCus = { ...pagination, showSizeChanger: false}
    return (
      <Content className="content">
        { accessRight.includes('Read') || accessRight == "" ?
          <div>
            <Row style={{marginBottom: '15px'}}>
              <Col md={12}>
                <Space size={20}>
                  { (dashboard) ?
                      <Avatar size="large" style={{ backgroundColor: 'red', background: '#27737D', cursor: 'pointer' }} icon={<LeftOutlined />} onClick={() => this.props.history.push('/dashboard') } />
                    : <></>
                  }

                  <Title level={2} style={{display: 'inline-block',margin: '0'}}>
                    Finished Ticket List
                  </Title>
                  <Modal
                    title="Detail Finish Order"
                    visible={this.state.visibelFinishOrder}
                    buttonCancel={() => this.handleModalDetailFOClose()}
                    detailFinishOrder={this.state.detailFinishOrder ? this.state.detailFinishOrder : []}
                    loading={this.state.loadingDetailFinishOrder}
                    accessRight={accessRight}
                    confirmTicket={(record) => this.confirmTicket(record)}
                    loadingConfirm={this.state.loadingConfirm}
                  />
                  <Modal
										title="Detail Ticket"
										visible={this.state.visibleDetailTOC}
										buttonCancel={() => this.handleModalDetailTOCClose()}
										detailTicketCancel={this.state.detailTicketCancel ? this.state.detailTicketCancel : []}
										loading={this.state.loadingDetailTicketCancel}
                    accessRight={accessRight}
                    reopenTicket={null}
                    loadingReopen={[]}
									/>
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
              <Col md={5}>
                <Select className="select-dashboard" defaultValue="" onChange={ (e) => this.searchFinish(e, 'ranting')} style={{ width: '100%' }}>
                  <Select.Option value="">Rating Filter</Select.Option>
                  <Select.Option value="1">1</Select.Option>
                  <Select.Option value="2">2</Select.Option>
                  <Select.Option value="3">3</Select.Option>
                  <Select.Option value="4">4</Select.Option>
                  <Select.Option value="5">5</Select.Option>
                </Select>
              </Col>
              <Col md={7} style={{textAlign: 'right'}}>
                <Input
                  className="input-search"
                  placeholder="Search.."
                  onChange={(e) => this.searchFinish(e, 'keyword')}
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
                    columns={columns}
                    rowKey={record => record.keyRanting}
                    dataSource={this.state.tikcetFinished}
                    pagination={paginationCus}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                    size="middle"
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

export default withRouter(FinishedOrder)
