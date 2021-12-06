import React from "react";
import { withRouter } from 'react-router-dom';
import { Layout, DatePicker, Row, Col, Card, Select, Input, Button, Typography, Avatar, Rate, Space, notification, Empty, Popconfirm } from 'antd';
import {
  SortAscendingOutlined,
  PlusOutlined,
  FilterFilled,
  SearchOutlined,
  FolderOpenOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  SnippetsOutlined,
  AuditOutlined
} from '@ant-design/icons';
import moment from 'moment'
import { Bar, Pie, Line } from 'react-chartjs-2';
import _debounce from 'lodash.debounce';
import 'leaflet/dist/leaflet.css';
import Modal from './modal';

import IconCompany from '../../../assets/company.svg';

import ModalTL from './../TicketingList/modal';
import { FSMServices } from "../../service";
import { GlobalFunction } from '../../global/function';
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title, Text } = Typography;

window.onunload = function () {
  window.scrollTo(0, 0);
}

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    document.title = this.props.name + " | FSM"
    this.handleModalDetailFOClose = this.handleModalDetailFOClose.bind(this);
    this.handleModalDetailCROClose = this.handleModalDetailCROClose.bind(this);
    this.handleModalDetailTOCClose = this.handleModalDetailTOCClose.bind(this);
    this.handleModalCreateTLClose = this.handleModalCreateTLClose.bind(this);
    this.handleModalSetTimeClose = this.handleModalSetTimeClose.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    this.state = {
      search: '',
      filterBy: '',
      searchFinish: '',
      searchConfirmReported: '',
      userIdAkun: this.props.userId,
      filterByFinish: '',
      orderByFinish: 'created_on,desc',
      filterByConfirmReported: '',
      orderByConfirmReported: 'created_on,desc',
      searchCancel: '',
      orderByCancel: 'created_on,desc',
      orderByOpen: 'created_on,desc',
      filterByStatus: 1,
      pagination: {
        defaultCurrent: 1,
        pageSize: 10
      },
      dispatchView: true,
      checkedSecondaryArea: false,
      checkedTechnician: false,
      totalRanting: 0,
      totalRantingConfirmReported: 0,
      markerClick: false,
      visibleCreateTL: false,
      visibleDetailTL: false,
      visibleSetTime: false,
      // visibleDispatch: false,
      visibleDetailFO: false,
      visibleDetailCRO: false,
      visibleDetailTOC: false,
      visibleHold: false,
      visibleCancel: false,
      idTicket: null,
      loading: true,
      loadingFinshed: true,
      loadingConfirmReported: true,
      loadingCancel: true,
      loadingOpen: true,
      loadingHold: true,
      loadingStatus: false,
      loadingPie: false,
      loadingBlock: false,
      loadingLine: false,
      loadingChart: false,
      loadingCancelTicket: false,
      ticketOpen: [],
      ticketFinish: [],
      ticketConfirmReported: [],
      ticketCancel: [],
      totalDataCancel: 0,
      totalDataConfirmReported: 0,
      dispatchList: [],
      detailFinishOrder: null,
      detailConfirmReportedOrder: null,
      detailTicketCancel: null,
      dataSLA: [],
      dataPic: [],
      status: "",
      dataChart: {
        datasets: [
          {
            data: []
          }
        ]
      },
      dataPie: {
        datasets: [
          {
            data: []
          }
        ]
      },
      dataLine: {
        datasets: [
          {
            data: []
          }
        ]
      },
      dataBlock: {
        datasets: [
          {
            data: []
          }
        ]
      },
      dataStatus: {
        totalTicketInProgress: 0,
        totalTicketFinishReported: 0,
        totalTicketOpen: 0,
        totalTicketHold: 0,
        totalTicketFinish: 0,
        totalTicketDispatch: 0,
        totalTicketCancel: 0
      },
      duration: [
        {
          id: 1,
          duration: 1
        },
        {
          id: 2,
          duration: 2
        },
        {
          id: 3,
          duration: 3
        },
        {
          id: 4,
          duration: 4
        },
        {
          id: 5,
          duration: 5
        },
        {
          id: 6,
          duration: 6
        },
        {
          id: 7,
          duration: 7
        },
        {
          id: 8,
          duration: 8
        },
        {
          id: 9,
          duration: 9
        },
        {
          id: 10,
          duration: 10
        },
        {
          id: 11,
          duration: 11
        },
        {
          id: 12,
          duration: 12
        },
      ],
      loadingCreateDispatch: [],
      optionListJob: [],
      onHitTicket: 0,
      dateNow: new Date(),
      dateYear: new Date().getFullYear(),
      dateMonth: new Date().getMonth() + 1,
      period: 'today',
      accessRight: '',
      loadingConfirm: [],
      userId: Cookies.get('userId'),
      optionListRefTicket: [],
      loadingReopen: [],
      loadingReopenDispatch: false,
      visibleReopen: false,
      loadingReopenTicket: false,
      idTicketReopen: null,
      optionListBranchByCompany: [],
      isDisabledBranch: true,
    }
  }

  componentDidMount() {
    const { dateYear, dateMonth } = this.state
    this.getOptionListCutomer();
    this.handleChangeStatus(1);
    this.getOptionListSLA();
    this.getOptionListPriority();
    this.getOptionListPIC();
    this.getOptionListJob();
    this.getOptionListRefTicket();
    this.getOptionListReport();
    this.getOptionListJobCategory();
    this.getOptionListJobClass();
    this.getOptionListCategory();
    this.handleScrollMount()
    this.handleRestartDashboard(dateYear, dateMonth)
    setTimeout(() => this.setState({ accessRight: sessionStorage.getItem("accessRight") }), 500);
  }

  handleRestartDashboard = (dateYear, dateMonth) => {
    this.getChartDispatch();
    this.getChartPie();
    this.getChartBlock(dateYear, dateMonth);
    this.getChartLine();
  }

  componentWillUnmount() {
    this.handleRemoveScroll()
  }

  handleRemoveScroll = () => {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScrollMount = () => {
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = () => {
    let { onHitTicket } = this.state
    let dataScroll = document.getElementById('openTicketComponent')
    // console.log('data scroll :', dataScroll.getBoundingClientRect().y)
    // console.log('windows scroll :', window.innerHeight)
    if (window.innerHeight >= dataScroll.getBoundingClientRect().y - 2) {
      onHitTicket = onHitTicket + 1
      if (onHitTicket <= 1) {
        this.setState({
          visibleTicketingStatus: true,
          onHitTicket: onHitTicket
        }, () => {
          this.handleAfterScroll()
        })
      }
    }
  }

  handleAfterScroll = () => {
    this.getTicketOpen('created_on,desc');
    this.getTicketFinish('created_on,desc');
    this.getTicketConfirmReported('created_on,desc');
    this.getTicketCancel('', 'created_on,desc');
  }



  getTicketOpen(sort) {
    this.setState({
      loadingOpen: true
    })
    FSMServices.getTicketOpen(sort)
      .then(res => {
        this.setState({
          ticketOpen: res ? res.data.Data : [],
          loadingOpen: false
        })
      })
  }

  getTicketFinish(sort) {
    this.setState({
      loadingFinshed: true
    })
    let data = []
    FSMServices.getTicketFinish(sort).then(res => {
      data = res ? res.data.Data : []
      this.normalizeDataFinishCancel('finish', data)
    })
  }

  getTicketConfirmReported(sort) {
    this.setState({
      loadingConfirmReported: true
    })
    let data = []
    FSMServices.getTicketConfirmReported(sort).then(res => {
      data = res ? res.data.Data : []
      this.setState({
        totalDataConfirmReported: res ? res.data.TotalData : 0
      })
      this.normalizeDataFinishCancel('confirm reported', data)
    })
  }

  getTicketCancel(search, sort) {
    this.setState({
      loadingCancel: true
    })
    let data = []
    FSMServices.getTicketCancel(search, sort).then(res => {
      data = res ? res.data.Data : []
      this.setState({
        totalDataCancel: res ? res.data.TotalData : 0
      })
      this.normalizeDataFinishCancel('cancel', data)
    })
  }

  normalizeDataFinishCancel = (name, dataFinishCancel) => {
    let totalRanting = 0
    let indexData = 0
    let temp = []
    temp = dataFinishCancel.map(data => {
      totalRanting += data.dispatchReportRating
      indexData += 1
      return {
        ticketCode: data.ticketCode,
        title: data.ticketTitle,
        ticketId: data.ticketId ? data.ticketId : null,
        companyName: data.companyName,
        ranting: data.dispatchReportRating,
        orderId: data.orderId,
        reason: data.reason ? data.reason : '',
        status: data.dispatchStatus,
        referenceTicket: data.referenceTicket
      }
    })
    totalRanting = totalRanting / indexData
    if (name === 'finish') {
      this.setState({
        ticketFinish: temp,
        loadingFinshed: false,
        totalRanting: totalRanting
      })
    } else if (name === 'confirm reported') {
      this.setState({
        ticketConfirmReported: temp,
        loadingConfirmReported: false,
        totalRantingConfirmReported: totalRanting
      })
    } else {
      this.setState({
        ticketCancel: temp,
        loadingCancel: false,
      })
    }
  }

  getDetailFinishOrder(orderId) {
    this.setState({
      loadingDetailFinishOrder: true,
    })
    FSMServices.getDetailFinishOrder(orderId).then(res => {
      let temp = res.data.Data
      if (typeof res.data.Data.value === 'object') {
        temp.value = temp.value
      } else if (typeof res.data.Data.value === 'string') {
        temp.value = JSON.parse(temp.value)
      } else {
        temp = ''
      }

      this.setState({
        detailFinishOrder: res ? temp : [],
        loadingDetailFinishOrder: false
      });
    });
  }

  getDetailConfirmReportedOrder(orderId) {
    this.setState({
      loadingDetailConfirmReportedOrder: true,
    })
    FSMServices.getDetailConfirmReportedOrder(orderId).then(res => {
      let temp = res.data.Data
      if (typeof res.data.Data.value === 'object') {
        temp.value = temp.value
      } else if (typeof res.data.Data.value === 'string') {
        temp.value = JSON.parse(temp.value)
      } else {
        temp = ''
      }

      this.setState({
        detailConfirmReportedOrder: res ? temp : [],
        loadingDetailConfirmReportedOrder: false
      });
    });
  }

  getDetailTicketCancel(ticketId) {
    this.setState({
      loadingDetailTicketCancel: true,
    })
    FSMServices.getDetailTicketCancel(ticketId).then(res => {
      this.setState({
        detailTicketCancel: res ? res.data.Data : null,
        loadingDetailTicketCancel: false
      });
    });
  }

  async getChartDispatch() {
    this.setState({
      loadingChart: true
    })
    let data = null
    await FSMServices.getChartDispatch(this.state.dateYear).then(res => {
      data = res ? res.data : null
      this.normalizeDataChart(data)
    })
  }

  async getOptionListSLA() {
    let data = []
    await FSMServices.getSLAOptions().then(res => {
      data = res ? res.data.Data : []
    })
    this.setState({
      dataSLA: data
    })
  }


  async getOptionListPriority() {
    let data = []
    await FSMServices.getPriority().then(res => {
      data = res ? res.data.Data : []
    })
    this.setState({
      dataPriority: data
    })
  }

  async getOptionListReport() {
    let data = []
    await FSMServices.getReport().then(res => {
      data = res ? res.data.Data : []
    })
    this.setState({
      dataReport: data
    })
  }

  async getChartPie() {
    this.setState({
      loadingPie: true
    })
    let data = null
    await FSMServices.getTicketPriority().then(res => {
      data = res ? res.data : null
    })
    let tempChart
    if (data !== undefined && data !== null) {
      tempChart = {
        labels: [
          'Urgent',
          'High',
          'Medium',
          'Low'
        ],
        datasets: [
          {
            data: [
              data.totalPriorityUrgent,
              data.totalPriorityHigh,
              data.totalPriorityMedium,
              data.totalPriorityLow
            ],
            backgroundColor: [
              '#4472c4',
              '#ed7d31',
              '#a5a5a5',
              '#ffc000'
            ]
          }
        ]
      }
    }

    this.setState({
      dataPie: tempChart,
      loadingPie: false
    })
  }

  async getChartBlock(dateYear, dateMonth) {
    let data = null
    this.setState({
      loadingBlock: true
    })
    await FSMServices.getNumberOfTicket(dateYear, dateMonth).then(res => {
      data = res ? res.data[0] : null
    })
    let temptBlock = []
    let name = [], ticketOpen = [], ticketCancel = []
    Object.keys(data).map(value => {
      name.push(value)
      ticketOpen.push(data[value].totalTicketStatusIdOpen)
      ticketCancel.push(data[value].totalTicketStatusIdClosed)
      return value
    })
    if (data !== undefined && data !== null) {
      temptBlock = {
        labels: name,
        datasets: [
          {
            label: 'Open',
            data: ticketOpen,
            backgroundColor: '#4472c4',
            borderColor: '#3a61a6',
            borderWidth: 1,
          },
          {
            label: 'Close',
            data: ticketCancel,
            backgroundColor: '#a5a5a5',
            borderColor: '#828282',
            borderWidth: 1,
          }
        ]
      }
    }
    this.setState({
      dataBlock: temptBlock,
      loadingBlock: false
    })
  }

  async getChartLine() {
    let resData = null
    this.setState({
      loadingLine: true
    })
    await FSMServices.getSolvingTime().then(res => {
      resData = res ? res.data : null
    })
    let temptLine = {
      labels: [
        resData.day3.date,
        resData.day2.date,
        resData.day1.date,
        resData.day0.date
      ],
      datasets: [
        {
          label: 'Incident',
          data: [
            resData.day3.avgIncident !== null ? resData.day3.avgIncident : 0,
            resData.day2.avgIncident !== null ? resData.day2.avgIncident : 0,
            resData.day1.avgIncident !== null ? resData.day1.avgIncident : 0,
            resData.day0.avgIncident !== null ? resData.day0.avgIncident : 0
          ],
          backgroundColor: '#4472c4',
          borderColor: '#4472c4',
          fill: false,
          borderWidth: 2,
          lineTension: 0,
        },
        {
          label: 'Request',
          data: [
            resData.day3.avgRequest !== null ? resData.day3.avgRequest : 0,
            resData.day2.avgRequest !== null ? resData.day2.avgRequest : 0,
            resData.day1.avgRequest !== null ? resData.day1.avgRequest : 0,
            resData.day0.avgRequest !== null ? resData.day0.avgRequest : 0
          ],
          backgroundColor: '#ed7d31',
          borderColor: '#ed7d31',
          fill: false,
          borderWidth: 2,
          lineTension: 0,
        },
        {
          label: 'Task',
          data: [
            resData.day3.avgTask !== null ? resData.day3.avgTask : 0,
            resData.day2.avgTask !== null ? resData.day2.avgTask : 0,
            resData.day1.avgTask !== null ? resData.day1.avgTask : 0,
            resData.day0.avgTask !== null ? resData.day0.avgTask : 0
          ],
          backgroundColor: '#a5a5a5',
          borderColor: '#a5a5a5',
          fill: false,
          borderWidth: 2,
          lineTension: 0,
        }
      ]
    }
    this.setState({
      dataLine: temptLine,
      loadingLine: false
    })
  }



  normalizeDataChart = (data) => {
    let temp = []
    if (data !== undefined && data !== null) {
      let { Januari, February, March, April, May, June, July, August, September, October, November, December } = data
      temp = {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
        ],
        datasets: [
          {
            label: 'Confirmed',
            backgroundColor: 'rgb(143, 212, 173)',
            borderColor: 'rgb(37, 174, 98)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgb(109, 209, 152)',
            hoverBorderColor: 'rgb(37, 174, 98)',
            data: [
              Januari.totalDispatchConfirmed,
              February.totalDispatchConfirmed,
              March.totalDispatchConfirmed,
              April.totalDispatchConfirmed,
              May.totalDispatchConfirmed,
              June.totalDispatchConfirmed,
              July.totalDispatchConfirmed,
              August.totalDispatchConfirmed,
              September.totalDispatchConfirmed,
              October.totalDispatchConfirmed,
              November.totalDispatchConfirmed,
              December.totalDispatchConfirmed
            ]
          },
          {
            label: 'Start',
            backgroundColor: 'rgb(198, 220, 250)',
            borderColor: 'rgb(53, 131, 236)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgb(168, 202, 247)',
            hoverBorderColor: 'rgb(53, 131, 236)',
            data: [
              Januari.totalDispatchStart,
              February.totalDispatchStart,
              March.totalDispatchStart,
              April.totalDispatchStart,
              May.totalDispatchStart,
              June.totalDispatchStart,
              July.totalDispatchStart,
              August.totalDispatchStart,
              September.totalDispatchStart,
              October.totalDispatchStart,
              November.totalDispatchStart,
              December.totalDispatchStart
            ]
          },
          {
            label: 'Finish',
            backgroundColor: 'rgb(248, 225, 156)',
            borderColor: 'rgb(242, 201, 80)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgb(250, 220, 130)',
            hoverBorderColor: 'rgb(242, 201, 80)',
            data: [
              Januari.totalDispatchFinish,
              February.totalDispatchFinish,
              March.totalDispatchFinish,
              April.totalDispatchFinish,
              May.totalDispatchFinish,
              June.totalDispatchFinish,
              July.totalDispatchFinish,
              August.totalDispatchFinish,
              September.totalDispatchFinish,
              October.totalDispatchFinish,
              November.totalDispatchFinish,
              December.totalDispatchFinish
            ]
          },
          {
            label: 'Hold',
            backgroundColor: 'rgb(249, 206, 168)',
            borderColor: 'rgb(243, 162, 92)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgb(250, 188, 132)',
            hoverBorderColor: 'rgb(243, 162, 92)',
            data: [
              Januari.totalDispatchHold,
              February.totalDispatchHold,
              March.totalDispatchHold,
              April.totalDispatchHold,
              May.totalDispatchHold,
              June.totalDispatchHold,
              July.totalDispatchHold,
              August.totalDispatchHold,
              September.totalDispatchHold,
              October.totalDispatchHold,
              November.totalDispatchHold,
              December.totalDispatchHold
            ]
          },
          {
            label: 'Reported',
            backgroundColor: 'rgb(143, 212, 173)',
            borderColor: 'rgb(37, 174, 98)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgb(109, 209, 152)',
            hoverBorderColor: 'rgb(37, 174, 98)',
            data: [
              Januari.totalDispatchReported,
              February.totalDispatchReported,
              March.totalDispatchReported,
              April.totalDispatchReported,
              May.totalDispatchReported,
              June.totalDispatchReported,
              July.totalDispatchReported,
              August.totalDispatchReported,
              September.totalDispatchReported,
              October.totalDispatchReported,
              November.totalDispatchReported,
              December.totalDispatchReported
            ]
          },
          {
            label: 'Canceled',
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: [
              Januari.totalDispatchCanceled,
              February.totalDispatchCanceled,
              March.totalDispatchCanceled,
              April.totalDispatchCanceled,
              May.totalDispatchCanceled,
              June.totalDispatchCanceled,
              July.totalDispatchCanceled,
              August.totalDispatchCanceled,
              September.totalDispatchCanceled,
              October.totalDispatchCanceled,
              November.totalDispatchCanceled,
              December.totalDispatchCanceled
            ]
          },
          {
            label: 'Confirm Reported',
            backgroundColor: 'rgba(215, 66, 245, 0.2)',
            borderColor: 'rgba(215, 66, 245, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(215, 66, 245, 0.4)',
            hoverBorderColor: 'rgba(215, 66, 245, 1)',
            data: [
              Januari.totalDispatchConfirmReported,
              February.totalDispatchConfirmReported,
              March.totalDispatchConfirmReported,
              April.totalDispatchConfirmReported,
              May.totalDispatchConfirmReported,
              June.totalDispatchConfirmReported,
              July.totalDispatchConfirmReported,
              August.totalDispatchConfirmReported,
              September.totalDispatchConfirmReported,
              October.totalDispatchConfirmReported,
              November.totalDispatchConfirmReported,
              December.totalDispatchConfirmReported
            ]
          }
        ]
      }
    }
    this.setState({
      dataChart: temp,
      loadingChart: false
    })
  }

  handleModalCreateTL = e => {
    this.setState({
      visibleCreateTL: !this.state.visibleCreateTL,
      loadingCreateTicket: false
    })
  }

  handleModalDetailTL = (id, jobId) => {
    this.setState({
      visibleDetailTL: !this.state.visibleDetailTL,
      loadingDetailITL: true,
      createDispatchJobId: jobId
    })
    this.getDetailTicketOpen(id)
  }

  handleModalDetailTLClose = () => {
    this.setState({
      visibleDetailTL: false
    })
  }

  handleModalSetTime = (ticketId, jobId) => {
    this.setState({
      visibleDetailTL: false,
      visibleSetTime: !this.state.visibleSetTime,
      createDispatchTicketId: ticketId,
      createDispatchJobId: jobId
    });
  }

  handleModalDetailFOClose() {
    this.setState({
      visibleDetailFO: false,
      loadingDetailFinishOrder: true,
    })
  }

  handleModalDetailCROClose() {
    this.setState({
      visibleDetailCRO: false,
      loadingDetailConfirmReportedOrder: true,
    })
  }

  handleModalDetailTOCClose() {
    this.setState({
      visibleDetailTOC: false,
      loadingDetailTicketCancel: true
    })
  }

  handleModalCreateTLClose() {
    this.setState({
      visibleCreateTL: false,
      loadingCreateTicket: true,
      isDisabledBranch: true
    })
  }
  handleModalSetTimeClose() {
    this.setState({
      visibleSetTime: false,
      loadingCreateDispatch: true,
      checkedSecondaryArea: false,
      checkedTechnician: false,
    })
  }

  handleModalDetailFO = orderId => {
    this.setState({ visibleDetailFO: !this.state.visibleDetailFO });
    this.getDetailFinishOrder(orderId);
  }

  handleModalDetailCRO = orderId => {
    this.setState({ visibleDetailCRO: !this.state.visibleDetailCRO });
    this.getDetailConfirmReportedOrder(orderId);
  }

  handleModalDetailTOC = ticketId => {
    this.setState({ visibleDetailTOC: !this.state.visibleDetailTOC });
    this.getDetailTicketCancel(ticketId);
  }

  handleChangeMonth = (event, dateString) => {
    let parseDate = Date.parse(moment(dateString, "MMMM YYYY"))
    let date = moment(parseDate).format('YYYY-M')
    this.setState({
      dateNow: event
    })
    let temp = date.split('-')
    this.getChartBlock(temp[0], temp[1])
  }

  // Form Ticketing and Create Ticketing
  getDetailTicketOpen(id) {
    FSMServices.getTicketOpenDetail(id).then(res => {
      this.setState({
        dataOpenDetail: res ? res.data.Data : null,
        loadingDetailITL: false
      });
    })
  }
  getOptionListCutomer() {
    FSMServices.getOptionListCustomer().then(res => {
      this.setState({
        optionListCustomer: res ? res.data.Data : []
      });
    })
  }

  getOptionListBranch(companyId) {
    this.setState({
      isDisabledBranch: true
    });
    FSMServices.getOptionListBranch(companyId).then(res => {
      this.setState({
        optionListBranchByCompany: res ? res.data.Data : [],
        isDisabledBranch: false
      })
    });
  }

  onChangeCustomer = e => {
    this.getOptionListBranch(e);
  }

  getOptionListPIC() {
    FSMServices.getOptionListPIC().then(res => {
      this.setState({
        dataPic: res ? res.data.Data : []
      })
    });
  }

  getOptionListJob() {
    FSMServices.searchGetListJob('').then(res => {
      this.setState({
        optionListJob: res ? res.data.Data : []
      })
    });
  }

  getOptionListRefTicket() {
    FSMServices.searchGetListRefTicket('').then(res => {
      this.setState({
        optionListRefTicket: res ? res.data.Data : []
      })
    });
  }

  getOptionListJobCategory() {
    FSMServices.getOptionListJobCategory().then(res => {
      this.setState({
        optionListJobCategory: res ? res.data.Data : []
      })
    });
  }

  onChangeJobCategory = e => {
    let dataMapping = [];
    this.state.optionListJob.map(item => {
      if (item.jobCategoryId === e) {
        let data = item;
        dataMapping.push(data);
      }

      return '';
    });
    this.setState({
      optionListJobByJobCategory: dataMapping
    })
  }

  getOptionListJobClass() {
    FSMServices.getOptionListJobClass().then(res => {
      this.setState({
        optionListJobClass: res ? res.data.Data : []
      })
    });
  }

  onChangeJobClass = e => {
    let dataMapping = [];
    this.state.optionListJobCategory.map(item => {
      if (item.jobClassId === e) {
        let data = item;
        dataMapping.push(data);
      }

      return '';
    });
    this.setState({
      optionListJobCategoryByjobClass: dataMapping
    })
  }

  getOptionListCategory() {
    FSMServices.getOptionListCategory().then(res => {
      this.setState({
        optionListCategory: res ? res.data.Data : []
      })
    });
  }

  async createTicket(data) {
    const { orderByOpen, filterByStatus, dateYear, dateMonth } = this.state
    this.setState({
      loadingCreateTicket: true
    });
    await FSMServices.createTicket(data).then(res => {
      if (res ? res.status === 200 : false) {
        if (res.data.Status === 'OK') {
          notification.success({
            placement: 'bottomRight',
            message: 'Success',
            description: res.data.Message ? res.data.Message : 'Create Ticket Success',
          });
          this.setState({
            visibleCreateTL: false
          });
          this.getTicketOpen(orderByOpen);
          this.handleChangeStatus(filterByStatus);
          this.handleRestartDashboard(dateYear, dateMonth)
        } else {
          notification.error({
            placement: 'bottomRight',
            message: 'Error',
            description: res.data.Message ? res.data.Message : 'Create Ticket Failed'
          });
        }
      } else {
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description: res.data.Message ? res.data.Message : 'Create Ticket Failed'
        });
      }
    })
    this.setState({
      loadingCreateTicket: false
    });
  }

  onFinishCreate = (values, fileName, filePath) => {
    const data = {
      ticketStatusId: "8",
      categoryId: values.categoryId.toString(),
      branchId: {
        branchId: values.branchId.toString()
      },
      companyId: {
        companyId: values.companyId.toString()
      },
      slaId: {
        slaId: values.slaId.toString()
      },
      jobId: {
        jobId: values.jobId.toString()
      },
      picId: {
        picId: values.picId.toString()
      },
      priorityId: values.priorityId.toString(),
      fileName: fileName,
      filePath: filePath,
      ticketTitle: values.ticketTitle,
      ticketDescription: values.description,
      ticketDurationTime: values.ticketDurationTime,
      createdBy: Cookies.get('userId'),
      lastModifiedBy: Cookies.get('userId'),
      referenceTicketCode: values.refTicketCode
    }
    this.createTicket(data);
  }

  onChangeDate(date, dateString) {
    this.setState({
      dateString: dateString
    });
  }

  onChangeTime(time, timeString) {
    this.setState({
      timeString: timeString
    })
  }
  // End

  searchJob = (key) => {
    this.processSearchJob(GlobalFunction.searchEncode(key))
  }

  processSearchJob = _debounce(key => {
    const { optionListJob } = this.state
    let data = null
    FSMServices.searchGetListJob(key).then(res => {
      data = res ? res.data.Data : optionListJob
      this.setState({
        optionListJob: data
      })
    })
  }, 500)

  searchRefTicket = (key) => {
    this.processSearchRefTicket(GlobalFunction.searchEncode(key))
  }

  processSearchRefTicket = _debounce(key => {
    const { optionListRefTicket } = this.state
    let data = null
    FSMServices.searchGetListRefTicket(key).then(res => {
      data = res ? res.data.Data : optionListJob
      this.setState({
        optionListRefTicket: data
      })
    })
  }, 500)

  // Create Dispatch
  async createDispatch(data, workerId) {
    const { filterByStatus, orderByOpen, dateYear, dateMonth } = this.state
    let loadingButton = this.state.loadingCreateDispatch;
    loadingButton[workerId] = true;

    this.setState({
      loadingCreateDispatch: loadingButton
    });
    await FSMServices.createDispatch(data).then(res => {
      if (res ? res.status === 200 : false) {
        if (res.data.Status === 'OK') {
          notification.success({
            placement: 'bottomRight',
            message: 'Success',
            description: res.data.Message ? res.data.Message : 'Create Dispatch Success',
          });
          this.setState({
            visibleAssignDispatch: false,
            visibleSetTime: false
          });
          this.getTicketOpen(orderByOpen);
          this.handleChangeStatus(filterByStatus);
          this.handleRestartDashboard(dateYear, dateMonth)
        } else {
          notification.error({
            placement: 'bottomRight',
            message: 'Error',
            description: res.data.Message ? res.data.Message : 'Create Dispatch Failed'
          });
        }
      } else {
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description: res.data.Message ? res.data.Message : 'Create Dispatch Failed'
        });
      }
    });
    loadingButton[workerId] = false;
    this.setState({
      loadingCreateDispatch: loadingButton
    });
  }

  onFinishCreateDispatch(values) {
    this.getAllWorkerForDispatch(this.state.createDispatchTicketId, this.state.createDispatchJobId, values.dispatchDate.format("YYYY-MM-DD"), values.dispatchTime.format("HH:mm:ss"));
    this.setState({
      visibleAssignDispatch: true,
      dispatchTime: values.dispatchTime.format("HH:mm")
    });
  }

  handleAssignDispatchClose = () => {
    this.setState({
      visibleAssignDispatch: false,
      visibleSetTime: false,
      checkedSecondaryArea: false,
      checkedTechnician: false
    })
  }

  onAssign(workerId) {
    const data = {
      createdBy: Cookies.get('userId'),
      dispatchDate: this.state.dispatchDate,
      dispatchDesc: "",
      dispatchTime: `${this.state.dispatchTime}:00`,
      lastModifiedBy: Cookies.get('userId'),
      ticketId: {
        ticketId: this.state.createDispatchTicketId.toString()
      },
      userId: {
        userId: workerId.toString()
      }
    }

    this.createDispatch(data, workerId);
  }

  onChangeDispatchTime = (time, timeString) => {
    this.setState({
      dispatchTime: timeString
    });
  }

  onChangeDispatchDate = (date, dateString) => {
    this.setState({
      dispatchDate: dateString
    });
  }


  handleChangeTechnician = (val) => {
    this.setState({
      checkedTechnician: !this.state.checkedTechnician
    }, () => {
      this.handleChangeArea(val)
    })
  }

  handleChangeSecond = (val) => {
    this.setState({
      checkedSecondaryArea: !this.state.checkedSecondaryArea
    }, () => {
      this.handleChangeArea(val)
    })
  }

  handleChangeArea = (val) => {
    const { dispatchTicketId, createDispatchJobId, dispatchTicketDate, dispatchTicketTime } = this.state
    if (this.state.checkedSecondaryArea) {
      this.setState({
        loadingListWorkerForDispatch: true
      });
      FSMServices.getAllWorkerForDispatchBoth(dispatchTicketId, createDispatchJobId, dispatchTicketDate, dispatchTicketTime, this.state.period, this.state.checkedTechnician).then(res => {
        this.setState({
          listWorker: res ? res.data.Data : [],
          loadingListWorkerForDispatch: false
        });
      });
    } else {
      this.setState({
        loadingListWorkerForDispatch: true
      });
      FSMServices.getAllWorkerForDispatchNew(dispatchTicketId, createDispatchJobId, dispatchTicketDate, dispatchTicketTime, this.state.period, this.state.checkedTechnician).then(res => {
        this.setState({
          listWorker: res ? res.data.Data : [],
          loadingListWorkerForDispatch: false
        });
      });
    }
  }

  handleChangePeriod = (val) => {
    this.setState({
      period: val
    }, () => {
      const { dispatchTicketId, createDispatchJobId, dispatchTicketDate, dispatchTicketTime } = this.state
      if (this.state.checkedSecondaryArea) {
        this.setState({ loadingListWorkerForDispatch: true })
        FSMServices.getAllWorkerForDispatchBoth(dispatchTicketId, createDispatchJobId, dispatchTicketDate, dispatchTicketTime, this.state.period, this.state.checkedTechnician).then(res => {
          this.setState({
            listWorker: res ? res.data.Data : [],
            loadingListWorkerForDispatch: false
          });
        });
      } else {
        this.getAllWorkerForDispatch(dispatchTicketId, createDispatchJobId, dispatchTicketDate, dispatchTicketTime);
      }
    })
  }

  getAllWorkerForDispatch(ticketId, jobId, dispatchDate, dispatchTime) {
    this.setState({
      loadingListWorkerForDispatch: true,
      dispatchTicketId: ticketId,
      dispatchTicketDate: dispatchDate,
      dispatchTicketTime: dispatchTime
    });
    FSMServices.getAllWorkerForDispatchNew(ticketId, jobId, dispatchDate, dispatchTime, this.state.period, this.state.checkedTechnician).then(res => {
      this.setState({
        listWorker: res ? res.data.Data : [],
        loadingListWorkerForDispatch: false
      });
    });
  }
  // End

  //Filter finished order

  // searchTicketFinish(value){
  //   let finishOrderList = []
  //   this.state.finishOrderList.forEach(element => {
  //     if (element.workerName.toUpperCase().includes(value.target.value.toUpperCase())) {
  //       finishOrderList.push(element);
  //     } else if (value.target.value.toUpperCase() === "") {
  //       finishOrderList.push(element);
  //     }
  //   });
  //   this.setState({
  //     finishOrderListFilter: finishOrderList
  //   })
  // }

  // End


  handleChangeStatus = e => {
    const { dataStatus } = this.state
    this.setState({
      loadingStatus: true,
      filterByStatus: e
    })
    FSMServices.getStatusTicket(e).then(res => {
      this.setState({
        dataStatus: res ? res.data : dataStatus,
        loadingStatus: false
      })
    });
  }

  onChangeOpenStatus = e => {
    let name = ''
    if (e === 'newer') {
      name = 'created_on,desc'
    } else {
      name = 'created_on,asc'
    }
    this.setState({
      orderByOpen: name
    })
    this.getTicketOpen(name);
  }

  handleOchangeFinish = (e, name) => {
    const { searchFinish, orderByFinish, filterBy } = this.state
    let key = ''
    let sort = ''
    if (name === 'keyword') {
      key = e.target.value
      this.processSearchFinish(GlobalFunction.searchEncode(key))
    } else {
      key = e
      if (name === 'latest') {
        if (e === 'newer') {
          sort = 'created_on,desc'
        } else {
          sort = 'created_on,asc'
        }
        this.setState({
          orderByFinish: sort
        }, () => {
          this.handleFinishFilter(searchFinish, sort, filterBy)
        })
      } else {
        this.setState({
          filterBy: key
        }, () => {
          this.handleFinishFilter(searchFinish, orderByFinish, key)
        })
      }
    }
  }

  processSearchFinish = _debounce(key => {
    const { orderByFinish, filterBy } = this.state
    this.setState({
      searchFinish: key,
    }, () => {
      this.handleFinishFilter(key, orderByFinish, filterBy)
    })
  }, 500)

  handleFinishFilter = (searchFinish, orderByFinish, filterBy) => {
    if (filterBy === '') {
      this.getFinishOrderSearch(searchFinish, orderByFinish)
    } else {
      this.getFinishOrderSearchFilter(filterBy, searchFinish, orderByFinish)
    }
  }

  getFinishOrderSearch = (search, sort) => {
    this.setState({
      loadingFinshed: true
    })
    let data = []
    FSMServices.getFinishOrderSearch(search, sort)
      .then(res => {
        data = res ? res.data.Data : []
        this.normalizeDataFinishCancel('finish', data)
      })
  }

  getFinishOrderSearchFilter = (filter, search, sort) => {
    this.setState({
      loadingFinshed: true
    })
    let data = []
    FSMServices.getFinishOrderSearchFilter(filter, search, sort)
      .then(res => {
        data = res ? res.data.Data : []
        this.normalizeDataFinishCancel('finish', data)
      })
  }

  handleOchangeConfirmReported = (e, name) => {
    const { searchConfirmReported, orderByConfirmReported, filterBy } = this.state
    let key = ''
    let sort = ''
    if (name === 'keyword') {
      key = e.target.value
      this.processSearchConfirmReported(GlobalFunction.searchEncode(key))
    } else {
      key = e
      if (name === 'latest') {
        if (e === 'newer') {
          sort = 'created_on,desc'
        } else {
          sort = 'created_on,asc'
        }
        this.setState({
          orderByConfirmReported: sort
        }, () => {
          this.handleConfirmReportedFilter(searchConfirmReported, sort, filterBy)
        })
      } else {
        this.setState({
          filterBy: key
        }, () => {
          this.handleConfirmReportedFilter(searchConfirmReported, orderByConfirmReported, key)
        })
      }
    }
  }

  processSearchConfirmReported = _debounce(key => {
    const { orderByConfirmReported, filterBy } = this.state
    this.setState({
      searchConfirmReported: key,
    }, () => {
      this.handleConfirmReportedFilter(key, orderByConfirmReported, filterBy)
    })
  }, 500)

  handleConfirmReportedFilter = (searchConfirmReported, orderByConfirmReported, filterBy) => {
    if (filterBy === '') {
      this.getConfirmReportedOrderSearch(searchConfirmReported, orderByConfirmReported)
    } else {
      this.getConfirmReportedOrderSearchFilter(filterBy, searchConfirmReported, orderByConfirmReported)
    }
  }

  getConfirmReportedOrderSearch = (search, sort) => {
    this.setState({
      loadingConfirmReported: true
    })
    let data = []
    FSMServices.getConfirmReportedOrderSearch(search, sort)
      .then(res => {
        data = res ? res.data.Data : []
        this.normalizeDataFinishCancel('confirm reported', data)
      })
  }

  getConfirmReportedOrderSearchFilter = (filter, search, sort) => {
    this.setState({
      loadingConfirmReported: true
    })
    let data = []
    FSMServices.getConfirmReportedOrderSearchFilter(filter, search, sort)
      .then(res => {
        data = res ? res.data.Data : []
        this.normalizeDataFinishCancel('confirm reported', data)
      })
  }

  handleOchangeCancel = (e, name) => {
    const { searchCancel } = this.state
    let key = ''
    let sort = ''
    if (name === 'keyword') {
      key = e.target.value
      this.processSearchCancel(GlobalFunction.searchEncode(key))
    } else {
      if (name === 'latest') {
        if (e === 'newer') {
          sort = 'created_on,desc'
        } else {
          sort = 'created_on,asc'
        }
        this.setState({
          orderByCancel: sort
        }, () => {
          this.handleCancelFilter(searchCancel, sort)
        })
      }
    }
  }

  processSearchCancel = _debounce(key => {
    const { orderByCancel } = this.state
    this.setState({
      searchCancel: key,
    }, () => {
      this.handleCancelFilter(key, orderByCancel)
    })
  }, 500)

  handleCancelFilter = (search, sort) => {
    this.getCancelOrderSearch(search, sort)
  }

  getCancelOrderSearch = (search, sort) => {
    this.setState({
      loadingCancel: true
    })
    let data = []
    FSMServices.getTicketCancel(search, sort)
      .then(res => {
        data = res ? res.data.Data : []
        this.setState({
          totalDataCancel: res ? res.data.TotalData : 0
        })
        this.normalizeDataFinishCancel('cancel', data)
      })
  }

  directToTicketingList = (e, val) => {
    var menu = JSON.parse(Cookies.get('menu'))
    for (var i = 0; i < menu.length; i++) {
      if (menu[i].name == 'Ticket List') {
        for (var j = 0; j < menu[i].submenu.length; j++) {
          if (menu[i].submenu[j].name == 'Ticketing List') {
            for (var k = 0; k < menu[i].submenu[j].accessRight.length; k++) {
              if (menu[i].submenu[j].accessRight[k] == 'Read') {
                this.props.history.push({
                  pathname: '/ticketing-list',
                  state: { status: val }
                })
                break
                break
                break
              }
            }
          }
        }
      }
    }
  }

  renderCard = (loadingStatus, dataStatus) => {
    const nameCard = [
      'Open',
      'Dispatch',
      'In Progress',
      'Hold',
      'Finish',
      'Cancel',
      'Reported',
      'Confirm Reported'
    ]
    const nameDirection = [
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '30',
      '45'
    ]
    const valStatus = [
      dataStatus.totalTicketOpen,
      dataStatus.totalTicketDispatch,
      dataStatus.totalTicketInProgress,
      dataStatus.totalTicketHold,
      dataStatus.totalTicketFinish,
      dataStatus.totalTicketCancel,
      dataStatus.totalTicketFinishReported,
      dataStatus.totalTicketConfirmReported
    ]
    const styleIcon = { margin: 'auto', marginTop: '23px', fontSize: '28px', color: 'white' }
    const icon = [
      <FolderOpenOutlined style={styleIcon} />,
      <SnippetsOutlined style={styleIcon} />,
      <ClockCircleOutlined style={styleIcon} />,
      <PauseCircleOutlined style={styleIcon} />,
      <CheckCircleOutlined style={styleIcon} />,
      <CloseCircleOutlined style={styleIcon} />,
      <FileDoneOutlined style={styleIcon} />,
      <AuditOutlined style={styleIcon} />
    ]
    const colorStyleSquere = [
      {
        background: '#3498db'
      },
      {
        background: '#2980b9'
      },
      {
        background: '#e67e22'
      },
      {
        background: '#f1c40f'
      },
      {
        background: '#2ecc71'
      },
      {
        background: '#e74c3c'
      },
      {
        background: '#27ae60'
      },
      {
        background: '#d742f5'
      },
    ]
    return (
      <>
        {nameCard.map((val, index) => {
          return (
            <Col span={3} key={val} style={{ maxWidth: '11%' }}>
              <Card
                hoverable
                bordered={false}
                onClick={(e) => this.directToTicketingList(e, nameDirection[index])}
                className='card-dashboard' loading={loadingStatus}
                style={{ textAlign: 'center' }}
              >
                <div className='card-horizontal'>
                  <div className='image-square' style={colorStyleSquere[index]}>
                    {icon[index]}
                  </div>
                  <div className='card-body'>
                    <p
                      style={{ marginTop: '0.3rem', marginBottom: '0px' }}
                    ><b>{valStatus[index]}</b></p>
                    <p style={{ lineHeight: 1 }}>{val}</p>
                  </div>
                </div>
              </Card>
            </Col>
          )
        })}
      </>
    )
  }

  handleCancelTicketModal = (id) => {
    this.setState({
      visibleCancel: !this.state.visibleCancel,
      idTicket: id
    })
  }

  handleCancelTicket = value => {
    const { orderByOpen, searchCancel, orderByCancel, filterByStatus, dateYear, dateMonth } = this.state
    this.setState({
      loadingCancelTicket: true
    })
    let data = {
      notes: value.reasonCancel,
      lastModifiedBy: Cookies.get('userId')
    }
    FSMServices.cancelTicket(data, this.state.idTicket).then(res => {
      if (res ? res.status === 200 : false) {
        if (res.data.Status === 'OK') {
          notification.success({
            placement: 'bottomRight',
            message: 'Success',
            description: res.data.Message ? res.data.Message : 'Cancel Ticket Success',
          });
          this.getTicketOpen(orderByOpen);
          this.handleCancelFilter(searchCancel, orderByCancel);
          this.handleChangeStatus(filterByStatus);
          this.handleRestartDashboard(dateYear, dateMonth)
        } else {
          notification.error({
            placement: 'bottomRight',
            message: 'Error',
            description: res.data.Message ? res.data.Message : 'Cancel Ticket Failed'
          });
        }
      } else {
        notification.error({
          placement: 'bottomRight',
          message: 'Error',
          description: res.data.Message ? res.data.Message : 'Cancel Ticket Failed'
        });
      }
      this.setState({
        loadingCancelTicket: false,
        visibleCancel: false
      });
    })
  }

  directToCancel = () => {
    var menu = JSON.parse(Cookies.get('menu'))
    for (var i = 0; i < menu.length; i++) {
      if (menu[i].name == 'Ticket List') {
        for (var j = 0; j < menu[i].submenu.length; j++) {
          if (menu[i].submenu[j].name == 'Canceled Ticket') {
            for (var k = 0; k < menu[i].submenu[j].accessRight.length; k++) {
              if (menu[i].submenu[j].accessRight[k] == 'Read') {
                this.props.history.push('/ticket-on-cancel')
                break
                break
                break
              }
            }
          }
        }
      }
    }
  }

  directToOpen = () => {
    var menu = JSON.parse(Cookies.get('menu'))
    for (var i = 0; i < menu.length; i++) {
      if (menu[i].name == 'Ticket List') {
        for (var j = 0; j < menu[i].submenu.length; j++) {
          if (menu[i].submenu[j].name == 'Ticketing List') {
            for (var k = 0; k < menu[i].submenu[j].accessRight.length; k++) {
              if (menu[i].submenu[j].accessRight[k] == 'Read') {
                this.props.history.push('/ticketing-list')
                break
                break
                break
              }
            }
          }
        }
      }
    }
  }

  confirmTicket = async (record) => {
    let { loadingConfirm, userId, filterByStatus, dateYear, dateMonth } = this.state;
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
          this.handleChangeStatus(filterByStatus);
          this.handleRestartDashboard(dateYear, dateMonth)
          this.handleOchangeFinish("", "")
          this.handleOchangeConfirmReported("", "")
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

  reopenTicket = async (record) => {
    let { loadingReopen, userId, filterByStatus, dateYear, dateMonth, orderByOpen } = this.state;
    loadingReopen[record.orderId] = true;
    this.setState({ loadingReopen });

    var data = {
      createdBy: parseInt(userId),
    }

    await FSMServices.reopenTicket(record.ticketId, data)
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
          this.handleChangeStatus(filterByStatus);
          this.handleRestartDashboard(dateYear, dateMonth)
          this.getTicketOpen(orderByOpen);
          this.handleOchangeFinish("", "")
          this.handleOchangeCancel("newer", "latest");
          this.handleModalDetailTOCClose()
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

    loadingReopen[record.orderId] = false;
    this.setState({ loadingReopen });
  }

  handleReopenTicketModal = (id) => {
    this.setState({
      visibleReopen: !this.state.visibleReopen,
      idTicketReopen: id
    })
  }

  handleReopenTicket = async value => {
    const { idTicketReopen, userId, filterByStatus, dateYear, dateMonth, orderByOpen, orderByFinish, orderByCancel } = this.state
    this.setState({
      loadingReopenTicket: true
    })
    let data = {
      reason: value.reasonCancel,
      createdBy: Cookies.get('userId')
    }

    await FSMServices.reopenTicketDispatch(idTicketReopen, data).then(res => {
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
        this.handleChangeStatus(filterByStatus);
        this.handleRestartDashboard(dateYear, dateMonth)
        this.getTicketOpen(orderByOpen);
        this.handleOchangeFinish("", "");
        this.handleOchangeCancel("newer", "latest");
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
    const formatDate = 'MMMM YYYY'
    const {
      loadingStatus,
      loadingFinshed,
      loadingConfirmReported,
      loadingCancel,
      loadingOpen,
      ticketOpen,
      totalRanting,
      totalRantingConfirmReported,
      ticketFinish,
      ticketConfirmReported,
      ticketCancel,
      dataStatus,
      dataChart,
      dataPriority,
      dataReport,
      dataSLA,
      dataPic,
      slaId,
      dataPie,
      dataBlock,
      dataLine,
      visibleTicketingStatus,
      optionListJob,
      accessRight,
      optionListRefTicket,
      isDisabledBranch
    } = this.state
    const optionsListJob = optionListJob.map((item, index) => {
      return <Select.Option key={item.jobId + 'job' + index} value={item.jobId}>{item.jobName}</Select.Option>
    })

    const optionsListRefTicket = optionListRefTicket.map((item, index) => {
      return <Select.Option key={item.ticketCode + 'refTicket' + index} value={item.ticketCode}>{item.ticketCode}</Select.Option>
    })
    // let heightStyle = ticketOpen.length > 0 ? '16.9rem' : '14.3rem'
    return (
      <Content>
        { accessRight.includes('Read') || accessRight == "" ?
          <Row justify="center" style={{ marginTop: 150 }}>
            <Col xs={23} lg={20}>
              <Row gutter={[20, 20]}>
                <Col xs={10} sm={19}>
                  <Space>
                    <Title level={2} className="text-heading">Ticket Status</Title>
                  </Space>
                </Col>
                <Col xs={2} sm={1}>
                  <FilterFilled className="icon-sort-filter" />
                </Col>
                <Col xs={12} sm={4}>
                  <Select className="select-dashboard" defaultValue="1" onChange={(e) => this.handleChangeStatus(e)}>
                    <Select.Option value="1">Today</Select.Option>
                    <Select.Option value="2">Last Week</Select.Option>
                    <Select.Option value="3">Last Month</Select.Option>
                    <Select.Option value="5">Last 2 Month</Select.Option>
                    <Select.Option value="6">Last 6 Month</Select.Option>
                    <Select.Option value="4">Last Year</Select.Option>
                  </Select>
                </Col>
              </Row>
              <Row
                gutter={[0, 40]}
                justify='space-around'>
                {this.renderCard(loadingStatus, dataStatus)}
              </Row>
              <Row gutter={[20, 20]} id="chartElementId">
                <Col xs={24} md={24}>
                  <Row gutter={[8, 24]}>
                    <Col span={12}>
                      <Card className="card card-cart">
                        <Card bordered={false} style={{ minHeight: 400 }}>
                          <p style={{ marginBottom: '52px' }}>Base on Priority</p>
                          <Pie
                            height={170}
                            data={dataPie}>
                          </Pie>
                        </Card>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card className="card card-cart">
                        <Card bordered={false} style={{ minHeight: 400 }}>
                          <p>Number of Ticket</p>
                          <DatePicker
                            format={formatDate}
                            allowClear={false}
                            style={{ marginBottom: '10px' }}
                            value={moment(this.state.dateNow, formatDate)}
                            onChange={(e, dateString) => this.handleChangeMonth(e, dateString)} picker="month" />
                          <Bar
                            height={170}
                            data={dataBlock}
                          ></Bar>
                        </Card>
                      </Card>
                    </Col>
                  </Row>
                  <Row gutter={[8, 24]}>
                    <Col span={12}>
                      <Card className="card card-cart">
                        <Card bordered={false} style={{ minHeight: 400 }}>
                          <p>Avg. Solving Time</p>
                          <Line
                            height={170}
                            data={dataLine}
                          ></Line>
                        </Card>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card className="card card-cart">
                        <Card bordered={false} style={{ minHeight: 400 }}>
                          <p>Dispatch List</p>
                          <Bar
                            height={170}
                            data={dataChart}>
                          </Bar>
                        </Card>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <div id="openTicketComponent" className="openTicketComponent">
                {visibleTicketingStatus ? (
                  <div>
                    <Row gutter={[20, 20]}>
                      <Col xs={24} md={24}>
                        <Row gutter={[10, 10]}>
                          <Col xs={24} sm={17}>
                            <Space>
                              <Title level={2} className="text-heading" style={{ cursor: 'pointer' }} onClick={() => this.directToOpen()}>
                                Open Ticket &nbsp;<Avatar style={{ backgroundColor: 'red' }}>{ticketOpen.length}</Avatar>
                              </Title>
                            </Space>
                          </Col>
                          {!accessRight.includes('Create') ?
                            <Col xs={11} sm={3}>
                            </Col>
                            : <></>
                          }
                          <Col xs={2} sm={1}>
                            <SortAscendingOutlined className="icon-sort-filter" />
                          </Col>
                          <Col xs={11} sm={3}>
                            <Select className="select-dashboard" defaultValue="newer" onChange={(e) => this.onChangeOpenStatus(e)}>
                              <Select.Option value="newer">Newer</Select.Option>
                              <Select.Option value="older">Older</Select.Option>
                            </Select>
                          </Col>
                          {accessRight.includes('Create') ?
                            <Col xs={11} sm={3}>
                              <Button className="button-create" style={{ padding: 0, textOverflow: 'ellipsis' }} type="primary" block icon={<PlusOutlined />} onClick={this.handleModalCreateTL}>CREATE</Button>
                            </Col>
                            : <></>
                          }
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Card className="card" loading={loadingOpen}>
                              <Card bordered={false} style={{ minWidth: ticketOpen.length * 320 }}>
                                {
                                  ticketOpen.length !== 0 ?
                                    ticketOpen.map(data =>
                                      <Card.Grid key={data.ticketId} className="card-grid" hoverable={false}>
                                        <Row>
                                          <Col span={12}><Text>#{data.ticketCode}</Text></Col>
                                          <Col span={12}><Text underline className="text-detail-ticket" onClick={() => this.handleModalDetailTL(data.ticketId, data.jobId)}>DETAIL</Text></Col>
                                        </Row>
                                        <Row style={{ height: 65 }}>
                                          <Col span={24}><Title level={4}>{data.ticketTitle.length > 30 ? `${data.ticketTitle.substr(0, 30)}...` : data.ticketTitle}</Title></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text><b>Ref. Ticket ID</b></Text></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text>{data.referenceTicket ? '#' + data.referenceTicket.ticketCode : '-'}</Text></Col>
                                        </Row>
                                        <Row style={{ margin: '10px 0' }}>
                                          <Col span={24} style={{ fontSize: 15, fontWeight: 'bold' }}>
                                            <Text level={4}><Avatar icon={<img src={IconCompany} alt="iconCompany" style={{ padding: 5, backgroundColor: "#fff" }} />} /> {data.companyName}</Text>
                                          </Col>
                                        </Row>
                                        <Row gutter={10}>
                                          {accessRight.includes('Dispatch') ?
                                            <Col span={10}><Button className="button-dispatch" type="primary" block onClick={() => { this.handleModalSetTime(data.ticketId, data.jobId) }}>DISPATCH</Button></Col>
                                            : <></>
                                          }
                                          {accessRight.includes('Cancel') ?
                                            <Col span={10}><Button className="button-dispatch" danger type="primary" block onClick={() => { this.handleCancelTicketModal(data.ticketId) }}>CANCEL</Button></Col>
                                            : <></>
                                          }
                                        </Row>
                                      </Card.Grid>
                                    ) :
                                    (<Empty />)}
                              </Card>
                            </Card>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row gutter={[20, 20]}>
                      <Col span={24}>
                        <Row gutter={[10, 10]}>
                          <Col xs={24} sm={10}>
                            <Space size={20}>
                              <Title level={2} className="text-heading">Finished Ticket</Title>
                              <Rate allowHalf disabled value={totalRanting} />
                            </Space>
                          </Col>
                          <Col xs={2} sm={1}>
                            <SortAscendingOutlined className="icon-sort-filter" />
                          </Col>
                          <Col xs={6} sm={3}>
                            <Select className="select-dashboard" defaultValue="newer" onChange={(e) => this.handleOchangeFinish(e, 'latest')}>
                              <Select.Option value="newer">Newer</Select.Option>
                              <Select.Option value="older">Older</Select.Option>
                            </Select>
                          </Col>
                          <Col xs={2} sm={1}>
                            <FilterFilled className="icon-sort-filter" />
                          </Col>
                          <Col xs={6} sm={3}>
                            <Select className="select-dashboard" defaultValue="" onChange={(e) => this.handleOchangeFinish(e, 'ranting')} style={{ width: '100%' }}>
                              <Select.Option value="">Rating Filter</Select.Option>
                              <Select.Option value="1">1</Select.Option>
                              <Select.Option value="2">2</Select.Option>
                              <Select.Option value="3">3</Select.Option>
                              <Select.Option value="4">4</Select.Option>
                              <Select.Option value="5">5</Select.Option>
                            </Select>
                          </Col>
                          <Col xs={8} sm={6}>
                            <Input
                              className="input-search"
                              placeholder="Search.."
                              prefix={<SearchOutlined />}
                              onChange={(e) => this.handleOchangeFinish(e, 'keyword')}
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Card className="card" loading={loadingFinshed}>
                              <Card bordered={false} style={{ minWidth: ticketFinish.length * 320 }}>
                                {
                                  ticketFinish.length !== 0 ?
                                    ticketFinish.map((data, index) =>
                                      <Card.Grid key={'ticketFinish' + index} className="card-grid" hoverable={false}>
                                        <Row>
                                          <Col span={12}><Text>{'#' + data.ticketCode}</Text></Col>
                                          <Col span={12}><Text underline className="text-detail-ticket" onClick={() => this.handleModalDetailFO(data.orderId)}>DETAIL</Text></Col>
                                        </Row>
                                        <Row style={{ height: 65 }}>
                                          <Col span={24}><Title level={4} style={{ fontWeight: 'bold', margin: 0 }}>{data.title.length > 30 ? `${data.title.substr(0, 30)}...` : data.title}</Title></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text><b>Ref. Ticket ID</b></Text></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text>{data.referenceTicket ? '#' + data.referenceTicket.ticketCode : '-'}</Text></Col>
                                        </Row>
                                        <Row style={{ marginTop: 10 }}>
                                          <Col span={24} style={{ fontSize: 15, fontWeight: 'bold' }}>
                                            <Text level={4}><Avatar icon={<img src={IconCompany} alt="iconCompany" style={{ padding: 5, backgroundColor: "#fff" }} />} /> {data.companyName}</Text>
                                          </Col>
                                        </Row>
                                        <Row style={{ marginBottom: 10 }}>
                                          <Col span={24} style={{ fontSize: 15, fontWeight: 'bold' }}>
                                            <Rate allowHalf disabled defaultValue={data.ranting} />
                                          </Col>
                                        </Row>
                                        <Row gutter={10}>
                                          {(accessRight.includes("Confirm Reported") && data.ranting > 0 && data.status == 'Reported') ?
                                            <Col span={10}>
                                              <Popconfirm
                                                title="Are you sure?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={() => this.confirmTicket(data)}
                                              >
                                                <Button
                                                  className="button-dispatch"
                                                  type="primary" block
                                                  loading={this.state.loadingConfirm[data.orderId]}>
                                                  CONFIRM
                                            </Button>
                                              </Popconfirm>
                                            </Col>
                                            : <></>
                                          }
                                          {(accessRight.includes('Re-Open') && data.ranting > 0 && data.status == 'Reported') ?
                                            <Col span={10}>
                                              <Button
                                                className="button-dispatch"
                                                type="primary" block
                                                style={{ backgroundColor: 'green', borderColor: 'green' }}
                                                loading={this.state.loadingReopenTicket}
                                                onClick={() => this.handleReopenTicketModal(data.ticketId)}>
                                                RE-OPEN
                                        </Button>
                                            </Col>
                                            : <></>
                                          }
                                        </Row>
                                      </Card.Grid>
                                    ) :
                                    (<Empty />)
                                }
                              </Card>
                            </Card>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row gutter={[20, 20]}>
                      <Col span={24}>
                        <Row gutter={[10, 10]}>
                          <Col xs={24} sm={10}>
                            <Space size={20}>
                              <Title level={2} className="text-heading">Confirm Reported</Title>
                              <Rate allowHalf disabled value={totalRantingConfirmReported} />
                            </Space>
                          </Col>
                          <Col xs={2} sm={1}>
                            <SortAscendingOutlined className="icon-sort-filter" />
                          </Col>
                          <Col xs={6} sm={3}>
                            <Select className="select-dashboard" defaultValue="newer" onChange={(e) => this.handleOchangeConfirmReported(e, 'latest')}>
                              <Select.Option value="newer">Newer</Select.Option>
                              <Select.Option value="older">Older</Select.Option>
                            </Select>
                          </Col>
                          <Col xs={2} sm={1}>
                            <FilterFilled className="icon-sort-filter" />
                          </Col>
                          <Col xs={6} sm={3}>
                            <Select className="select-dashboard" defaultValue="" onChange={(e) => this.handleOchangeConfirmReported(e, 'ranting')} style={{ width: '100%' }}>
                              <Select.Option value="">Rating Filter</Select.Option>
                              <Select.Option value="1">1</Select.Option>
                              <Select.Option value="2">2</Select.Option>
                              <Select.Option value="3">3</Select.Option>
                              <Select.Option value="4">4</Select.Option>
                              <Select.Option value="5">5</Select.Option>
                            </Select>
                          </Col>
                          <Col xs={8} sm={6}>
                            <Input
                              className="input-search"
                              placeholder="Search.."
                              prefix={<SearchOutlined />}
                              onChange={(e) => this.handleOchangeConfirmReported(e, 'keyword')}
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Card className="card" loading={loadingConfirmReported}>
                              <Card bordered={false} style={{ minWidth: ticketConfirmReported.length * 320 }}>
                                {
                                  ticketConfirmReported.length !== 0 ?
                                    ticketConfirmReported.map((data, index) =>
                                      <Card.Grid key={'ticketFinish' + index} className="card-grid" hoverable={false}>
                                        <Row>
                                          <Col span={12}><Text>{'#' + data.ticketCode}</Text></Col>
                                          <Col span={12}><Text underline className="text-detail-ticket" onClick={() => this.handleModalDetailFO(data.orderId)}>DETAIL</Text></Col>
                                        </Row>
                                        <Row style={{ height: 65 }}>
                                          <Col span={24}><Title level={4} style={{ fontWeight: 'bold', margin: 0 }}>{data.title.length > 30 ? `${data.title.substr(0, 30)}...` : data.title}</Title></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text><b>Ref. Ticket ID</b></Text></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text>{data.referenceTicket ? '#' + data.referenceTicket.ticketCode : '-'}</Text></Col>
                                        </Row>
                                        <Row style={{ marginTop: 10 }}>
                                          <Col span={24} style={{ fontSize: 15, fontWeight: 'bold' }}>
                                            <Text level={4}><Avatar icon={<img src={IconCompany} alt="iconCompany" style={{ padding: 5, backgroundColor: "#fff" }} />} /> {data.companyName}</Text>
                                          </Col>
                                        </Row>
                                        <Row style={{ marginBottom: 10 }}>
                                          <Col span={24} style={{ fontSize: 15, fontWeight: 'bold' }}>
                                            <Rate allowHalf disabled defaultValue={data.ranting} />
                                          </Col>
                                        </Row>
                                      </Card.Grid>
                                    ) :
                                    (<Empty />)
                                }
                              </Card>
                            </Card>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row gutter={[20, 20]}>
                      <Col span={24}>
                        <Row gutter={[10, 10]}>
                          <Col xs={24} sm={14}>
                            <Space>
                              <Title level={2} className="text-heading" style={{ cursor: 'pointer' }} onClick={() => this.directToCancel()}>
                                Canceled Ticket &nbsp;<Avatar style={{ backgroundColor: 'red' }}>{this.state.totalDataCancel}</Avatar>
                              </Title>
                            </Space>
                          </Col>
                          <Col xs={2} sm={1}>
                            <SortAscendingOutlined className="icon-sort-filter" />
                          </Col>
                          <Col xs={10} sm={3}>
                            <Select className="select-dashboard" defaultValue="newer" onChange={(e) => this.handleOchangeCancel(e, 'latest')} style={{ width: '100%' }}>
                              <Select.Option value="newer">Newer</Select.Option>
                              <Select.Option value="older">Older</Select.Option>
                            </Select>
                          </Col>
                          <Col xs={12} sm={6}>
                            <Input
                              className="input-search"
                              placeholder="Search.."
                              onChange={(e) => this.handleOchangeCancel(e, 'keyword')}
                              prefix={<SearchOutlined />}
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Card className="card" loading={loadingCancel}>
                              <Card bordered={false} style={{ minWidth: ticketCancel.length * 320 }}>
                                {
                                  ticketCancel.length !== 0 ?
                                    ticketCancel.map((data, index) =>
                                      <Card.Grid key={'ticketCancel01' + index} className="card-grid" hoverable={false}>
                                        <Row>
                                          <Col span={12}><Text>#{data.ticketCode}</Text></Col>
                                          <Col span={12}><Text underline className="text-detail-ticket" onClick={() => { this.handleModalDetailTOC(data.ticketId) }}>DETAIL</Text></Col>
                                        </Row>
                                        <Row style={{ height: 65 }}>
                                          <Col span={24}><Title level={4} style={{ fontWeight: 'bold', margin: 0 }}>{data.title.length > 30 ? `${data.title.substr(0, 30)}...` : data.title}</Title></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text><b>Ref. Ticket ID</b></Text></Col>
                                        </Row>
                                        <Row>
                                          <Col span={12}><Text>{data.referenceTicket ? '#' + data.referenceTicket.ticketCode : '-'}</Text></Col>
                                        </Row>
                                        <Row style={{ marginTop: 10 }}>
                                          <Col span={24} style={{ fontSize: 15, fontWeight: 'bold' }}>
                                            <Text level={4}><Avatar icon={<img src={IconCompany} alt="iconCompany" style={{ padding: 5, backgroundColor: "#fff" }} />} /> {data.companyName}</Text>
                                          </Col>
                                        </Row>
                                        <Row style={{ margin: '10px 0' }}>
                                          <Col span={24} style={{ fontSize: 15, fontWeight: 'bold' }}>
                                            <Text><i>"{data.reason.length > 20 ? `${data.reason.substr(0, 20)}` : data.reason}..."</i></Text>
                                          </Col>
                                        </Row>
                                        <Row gutter={10}>
                                          {(accessRight.includes("Re-Open")) ?
                                            <Col span={10}>
                                              <Popconfirm
                                                title="Are you sure?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={() => this.reopenTicket(data)}
                                              >
                                                <Button
                                                  className="button-dispatch"
                                                  type="primary" block
                                                  style={{ backgroundColor: 'green', borderColor: 'green' }}
                                                  loading={this.state.loadingReopen[data.orderId]}>
                                                  RE-OPEN
                                            </Button>
                                              </Popconfirm>
                                            </Col>
                                            : <></>
                                          }
                                        </Row>
                                      </Card.Grid>
                                    ) :
                                    (<Empty />)}
                              </Card>
                            </Card>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                ) : (
                  <>
                  </>
                )}
              </div>
            </Col>
          </Row>
          :
          <Row justify="center" style={{ marginTop: 150 }}>
            <PermissionDenied />
          </Row>
        }
        <ModalTL
          title="New Ticket"
          visible={this.state.visibleCreateTL}
          buttonCancel={this.handleModalCreateTLClose}
          customer={this.state.optionListCustomer}
          onChangeCustomer={e => this.onChangeCustomer(e)}
          subLocation={this.state.optionListBranchByCompany}
          searchJob={val => this.searchJob(val)}
          pic={dataPic}
          job={optionsListJob}
          jobCategory={this.state.optionListJobCategoryByjobClass}
          onChangeJobCategory={e => this.onChangeJobCategory(e)}
          jobClass={this.state.optionListJobClass}
          onChangeJobClass={e => this.onChangeJobClass(e)}
          category={this.state.optionListCategory}
          duration={this.state.duration}
          dataReport={dataReport}
          dataPriority={dataPriority}
          slaId={slaId}
          dataSLA={dataSLA}
          onFinish={(values, fileName, filePath) => this.onFinishCreate(values, fileName, filePath)}
          onChangeDate={(date, dateString) => this.onChangeDate(date, dateString)}
          onChangeTime={(time, timeString) => this.onChangeTime(time, timeString)}
          loadingCreateTicket={this.state.loadingCreateTicket}
          refTicket={optionsListRefTicket}
          searchRefTicket={val => this.searchRefTicket(val)}
          isDisabledBranch={isDisabledBranch}
        />
        <ModalTL
          title="Detail Ticket"
          status="Open"
          dataTicket={this.state.dataOpenDetail ? this.state.dataOpenDetail : []}
          visible={this.state.visibleDetailTL}
          loading={this.state.loadingDetailITL}
          buttonDispatch={() => this.handleModalSetTime(this.state.dataOpenDetail.ticketId, this.state.createDispatchJobId)}
          buttonCancel={() => this.handleModalDetailTLClose()}
          accessRight={accessRight}
        />
        <ModalTL
          title="Cancel Ticket"
          visible={this.state.visibleCancel}
          buttonCancel={() => this.handleCancelTicketModal(this.state.idTicket)}
          loadingCancelTicket={this.state.loadingCancelTicket}
          onFinish={value => this.handleCancelTicket(value)}
        >
        </ModalTL>
        <ModalTL
          title="Reopen Ticket"
          visible={this.state.visibleReopen}
          buttonCancel={() => this.handleReopenTicketModal(this.state.idTicketReopen)}
          loadingReopenTicket={this.state.loadingReopenTicket}
          onFinish={value => this.handleReopenTicket(value)}
        >
        </ModalTL>
        <Modal
          title="Set Time"
          visible={this.state.visibleSetTime}
          handleChecked={this.state.checkedSecondaryArea}
          handleCheckedTechnician={this.state.checkedTechnician}
          buttonCancel={this.handleModalSetTimeClose}
          onFinish={values => this.onFinishCreateDispatch(values)}
          visibleAssignDispatch={this.state.visibleAssignDispatch}
          buttonCancelAssign={() => this.handleAssignDispatchClose()}
          onChangeDate={this.onChangeDispatchDate}
          onChangeTime={this.onChangeDispatchTime}
          loadingListWorker={this.state.loadingListWorkerForDispatch}
          changeArea={(val) => this.handleChangeSecond(val)}
          changeAreaTechnician={(val) => this.handleChangeTechnician(val)}
          listWorker={this.state.listWorker}
          assign={workerId => this.onAssign(workerId)}
          loadingCreateDispatch={this.state.loadingCreateDispatch}
          handleChangePeriod={(val) => this.handleChangePeriod(val)}
        />
        <Modal
          title="Detail Finish Order"
          visible={this.state.visibleDetailFO}
          buttonCancel={this.handleModalDetailFOClose}
          detailFinishOrder={this.state.detailFinishOrder ? this.state.detailFinishOrder : []}
          loading={this.state.loadingDetailFinishOrder}
          accessRight={accessRight}
          confirmTicket={(record) => this.confirmTicket(record)}
          loadingConfirm={this.state.loadingConfirm}
        />
        <Modal
          title="Detail Confirm Reported Order"
          visible={this.state.visibleDetailCRO}
          buttonCancel={this.handleModalDetailCROClose}
          detailConfirmReportedOrder={this.state.detailConfirmReportedOrder ? this.state.detailConfirmReportedOrder : []}
          loading={this.state.loadingDetailConfirmReportedOrder}
        />
        <Modal
          title="Detail Ticket"
          visible={this.state.visibleDetailTOC}
          buttonCancel={this.handleModalDetailTOCClose}
          detailTicketCancel={this.state.detailTicketCancel ? this.state.detailTicketCancel : []}
          loading={this.state.loadingDetailTicketCancel}
          accessRight={accessRight}
          reopenTicket={(record) => this.reopenTicket(record)}
          loadingReopen={this.state.loadingReopen}
        />
      </Content>
    )
  }
}

export default withRouter(Dashboard);
