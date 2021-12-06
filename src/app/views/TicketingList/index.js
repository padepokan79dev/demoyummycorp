import React from "react";
import { withRouter } from "react-router-dom";
import { Layout, Popconfirm, Typography, Row, Col, Button, Input, Card, Space, Avatar, Tag, notification, Table, Select } from "antd";
import { PlusOutlined, SearchOutlined, CloseOutlined, EditFilled, LeftOutlined, DownloadOutlined } from '@ant-design/icons';
import ModalTicket from './modal';
import Modal from '../Dashboard/modal';
import _debounce from 'lodash.debounce';
import { GlobalFunction } from '../../global/function';
import { FSMServices } from "../../service";
import PermissionDenied from '../../global/permissionDenied'
import Cookies from 'js-cookie'

const { Content } = Layout;
const { Title, Text } = Typography;

class TicketingList extends React.Component {
    constructor(props) {
        super(props);
        document.title = this.props.name + " | FSM"

        this.state = {
            visibleCreate: false,
            visibleUpdate: false,
            visibleDetail: false,
            visibleDelete: false,
            dataDeleted: {},
            search: '',
            statusFilter: '',
            pagination: {
                defaultCurrent: 1,
                pageSize: 10
            },
            loading: true,
            loadingCreateUpdateTicket: false,
            loadingUpdateTicket: false,
            loadingDelete: [],
            dataPic: [],
            deleteId: null,
            listTicket: [],
            listTicketTotal: 0,
            skip: 0,
            top: 7,
            orderBy: 'created_on,desc',
            filterBy: 'lucy',
            statusTicket: '',
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
            loadingCancel: false,
            visibleCancel: false,
            loadingCancelTicket: false,
            idTicket: null,
            period: 'today',
            accessRight: '',
            dashboard: false,
            optionListRefTicket: [],
            loadingReopen: [],
            loadingReopenDispatch: false,
            visibleReopen: false,
            loadingReopenTicket: false,
            idTicketReopen: null,
            branchByCompanyUpdate: [],
            optionListBranchByCompany: [],
            isDisabledBranch: true
        }
        this.link = React.createRef();
    }

    getNotification() {
        var notification = localStorage.getItem("notification")
        localStorage.removeItem("notification")

        if (notification == 'open') {
            this.setState({
                filterBy: "8"
            }, () => {
                this.onChangeStatus("8")
            })
        } else {
            this.setState({ search: (notification) ? notification : '' }, () => {
                this.getTicketList(this.state.search, 1, 10, 'created_on,desc');
            })
        }
    }

    componentDidMount() {
        this.getOptionListCutomer();
        this.getOptionListSLA();
        this.getOptionListPriority();
        this.getOptionListPIC();
        this.getOptionListJob();
        this.getOptionListRefTicket();
        this.getOptionListReport();
        this.getOptionListJobCategory();
        this.getOptionListJobClass();
        this.getOptionListCategory();
        this.getAccessDashboard();
        this.setState({
            userIdAkun: this.props.userId,
        })
        setTimeout(() => this.setState({ accessRight: sessionStorage.getItem("accessRight") }), 500);

        if (this.props.location.state !== undefined && this.props.location.state !== null) {
            this.handleFromDashboard(this.props.location.state)
        } else {
            this.getNotification();
        }
    }

    getAccessDashboard() {
        var menu = JSON.parse(Cookies.get('menu'))
        for (var i = 0; i < menu.length; i++) {
            if (menu[i].name == 'Dashboard') {
                for (var j = 0; j < menu[i].accessRight.length; j++) {
                    if (menu[i].accessRight[j] == 'Read') {
                        this.setState({ dashboard: true })
                        break
                        break
                    }
                }
            }
        }
    }

    handleFromDashboard = data => {
        this.setState({
            filterBy: data.status
        }, () => {
            this.onChangeStatus(data.status)
        })
    }

    handleModalCreate = e => {
        this.setState({
            visibleCreate: !this.state.visibleCreate,
            isDisabledBranch: true,
            loadingCreateUpdateTicket: false
        })
    }

    handleModalUpdate = e => {
        this.setState({
            visibleUpdate: !this.state.visibleUpdate,
            isDisabledBranch: true,
            loadingCreateUpdateTicket: false
        })
    }

    handleModalDetail = (ticketId, jobId, status) => {
        this.setState({
            visibleDetail: !this.state.visibleDetail,
            createDispatchJobId: jobId,
            statusTicket: status
        });
        this.getDetailTicket(ticketId);
    }

    // get list api
    async getTicketList(keyword, page, size, orderBy) {
        let params = {
            keyword: keyword,
            page: page,
            size: size,
            orderBy: orderBy
        }
        this.setState({
            loading: true,
        })
        let data = [];
        let totalTicket = 0
        await FSMServices.getTicketList(params)
            .then(res => {
                data = res ? res.data.Data : []
                totalTicket = res ? res.data.TotalData : 0
            });
        this.setState({
            listTicket: data.map(item => {
                return {
                    key: item.ticketId,
                    ticket_id: item.ticketId,
                    ticket_code: item.ticketCode,
                    ticket_title: item.ticketTitle,
                    jobId: item.jobId,
                    worker_name: item.workerName ? item.workerName : "-",
                    company_name: item.companyName,
                    start_job: item.startJob && item.startJob !== "-" ? new Date(item.startJob).toLocaleDateString() : "-",
                    resolution_time: item.resolutionTime,
                    ticket_status_id: item.ticketStatus,
                    file_name: item.fileName,
                    geofencing: item.geofencing,
                    reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
                    reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
                }
            }),
            pagination: {
                current: page,
                total: totalTicket
            },
            listTicketTotal: data.length,
            loading: false
        });
    }

    getDetailTicket(ticketId) {
        this.setState({
            detailLoading: true,
        })
        FSMServices.getDetailTicket(ticketId).then(res => {
            this.setState({
                getDetailTicket: res ? res.data.Data : [],
                detailLoading: false
            });
        });
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
        })
        FSMServices.getOptionListBranch(companyId).then(res => {
            this.setState({
                optionListBranch: res ? res.data.Data : [],
                branchByCompanyUpdate: res ? res.data.Data : [],
                optionListBranchByCompany: res ? res.data.Data : [],
                isDisabledBranch: false
            })
        });
    }

    onChangeCustomer = e => {
        this.getOptionListBranch(e)
    }

    getOptionListSLAType() {
        FSMServices.getOptionListSLAType().then(res => {
            this.setState({
                optionListSLAType: res ? res.data.items : []
            })
        });
    }

    getOptionListPIC() {
        FSMServices.getOptionListPIC().then(res => {
            this.setState({
                dataPic: res ? res.data.Data : []
            })
        });
    }

    onChangeSubLocation = e => {
        let dataMapping = [];
        this.state.optionListPIC.map(item => {
            if (item.branchId === e) {
                let data = item;
                dataMapping.push(data);
            }

            return '';
        });
        this.setState({
            picByCompanyUpdate: dataMapping,
            optionListPICBySubLocation: dataMapping
        })
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
            jobByCategoryUpdate: dataMapping,
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
            categoryByClassUpdate: dataMapping,
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

    createTicket = (data) => {
        const { search, filterBy, orderBy } = this.state
        FSMServices.createTicket(data).then(res => {
            if (res ? res.status === 200 : false) {
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: 'Create Ticket Success',
                    });
                    if (filterBy === 'lucy' || filterBy === '') {
                        this.getTicketListSearch(search, 1, 10, orderBy)
                    } else {
                        this.getTicketListSearchStatus(filterBy, search, 1, 10, orderBy)
                    }
                    this.setState({
                        visibleCreate: false
                    })
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
            this.setState({ loadingCreateUpdateTicket: false })
        })
    }

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

    // Update Ticket
    editTicket = (data, id) => {
        const { search, filterBy, orderBy } = this.state
        FSMServices.editTicket(data, id).then(res => {
            if (res ? res.status === 200 : false) {
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Update Ticket Success',
                    });
                    if (filterBy === 'lucy' || filterBy === '') {
                        this.getTicketListSearch(search, 1, 10, orderBy)
                    } else {
                        this.getTicketListSearchStatus(filterBy, search, 1, 10, orderBy)
                    }
                    this.setState({
                        visibleUpdate: false
                    })
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Update Ticket Failed'
                    });
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Update Ticket Failed'
                });
            }
            this.setState({ loadingCreateUpdateTicket: false })
        })
    }

    onFinishCreate = (values, fileName, filePath) => {
        this.setState({ loadingCreateUpdateTicket: true })
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
            ticketTitle: values.ticketTitle,
            ticketDescription: values.description,
            ticketDurationTime: values.ticketDurationTime,
            priorityId: values.priorityId.toString(),
            geofencing: values.geofencing,
            createdBy: this.state.userIdAkun,
            lastModifiedBy: this.state.userIdAkun,
            fileName: fileName,
            filePath: filePath,
            referenceTicketCode: values.refTicketCode
        }
        this.createTicket(data);
        this.setState({ filePath: "" });
    }

    onFinishEdit = (values, fileName, filePath) => {
        this.setState({ loadingCreateUpdateTicket: true })
        const data = {
            categoryId: values.categoryId.toString(),
            jobId: {
                jobId: values.jobId.toString()
            },
            picId: {
                picId: values.picId.toString()
            },
            priorityId: values.priorityId.toString(),
            ticketTitle: values.ticketTitle,
            ticketDescription: values.description,
            ticketDurationTime: values.ticketDurationTime,
            geofencing: values.geofencing,
            lastModifiedBy: this.state.userIdAkun,
            fileName: fileName ? fileName : this.state.troubleTicketById.fileName,
            filePath: filePath ? filePath : this.state.troubleTicketById.filePath,
            referenceTicketCode: values.refTicketCode
        }

        this.editTicket(data, this.state.troubleTicketById.ticketId);
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

    getTicketListSearch = (keyword, page, size, order) => {
        let params = {
            keyword: keyword,
            page: page,
            size: size,
            orderBy: order
        }
        this.setState({
            loading: true,
        })
        let data = [];
        let totalTicket = 0
        FSMServices.getTicketList(params)
            .then(res => {
                data = res ? res.data.Data : []
                totalTicket = res ? res.data.TotalData : 0
                this.setState({
                    listTicket: data.map(item => {
                        return {
                            key: item.ticketId,
                            ticket_id: item.ticketId,
                            ticket_code: item.ticketCode,
                            ticket_title: item.ticketTitle,
                            jobId: item.jobId,
                            worker_name: item.workerName ? item.workerName : "-",
                            company_name: item.companyName,
                            start_job: item.startJob && item.startJob !== "-" ? new Date(item.startJob).toLocaleDateString() : "-",
                            resolution_time: item.resolutionTime,
                            ticket_status_id: item.ticketStatus,
                            file_name: item.fileName,
                            geofencing: item.geofencing,
                            reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
                            reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
                        }
                    }),
                    pagination: {
                        current: page,
                        total: totalTicket
                    },
                    listTicketTotal: data.length,
                    loading: false
                });
            });
    }

    getTicketListSearchStatus = (filter, keyword, page, size, order) => {
        let params = {
            filter: filter,
            keyword: keyword,
            page: page,
            size: size,
            orderBy: order
        }
        this.setState({
            loading: true,
        })
        let data = [];
        let totalTicket = 0
        FSMServices.getTicketListFilter(params)
            .then(res => {
                data = res ? res.data.Data : []
                totalTicket = res ? res.data.TotalData : 0
                this.setState({
                    listTicket: data.map(item => {
                        return {
                            key: item.ticketId,
                            ticket_id: item.ticketId,
                            ticket_code: item.ticketCode,
                            ticket_title: item.ticketTitle,
                            jobId: item.jobId,
                            worker_name: item.workerName ? item.workerName : "-",
                            company_name: item.companyName,
                            start_job: item.startJob && item.startJob !== "-" ? new Date(item.startJob).toLocaleDateString() : "-",
                            resolution_time: item.resolutionTime,
                            ticket_status_id: item.ticketStatus,
                            file_name: item.fileName,
                            reference_ticket: (item.referenceTicket) ? item.referenceTicket : null,
                            reference_ticket_code: (item.referenceTicket) ? item.referenceTicket.ticketCode : "-",
                        }
                    }),
                    pagination: {
                        current: page,
                        total: totalTicket
                    },
                    listTicketTotal: data.length,
                    loading: false
                });
            });
    }

    searchChange(value) {
        let key = value.target.value
        this.setState({
            search: key,
        }, () => {
            this.processSearch(GlobalFunction.searchEncode(this.state.search))
        })
    }

    processSearch = _debounce(key => {
        const { filterBy, orderBy } = this.state
        if (filterBy === 'lucy' || filterBy === '') {
            this.getTicketListSearch(key, 1, 10, orderBy)
        } else {
            this.getTicketListSearchStatus(filterBy, key, 1, 10, orderBy)
        }
    }, 500)

    onChangeStatus = val => {
        const { search, orderBy } = this.state
        let key = val
        this.setState({
            filterBy: key
        }, () => {
            if (key === 'lucy') {
                this.getTicketListSearch(search, 1, 10, orderBy)
            } else {
                this.getTicketListSearchStatus(key, search, 1, 10, orderBy)
            }
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const { search, filterBy } = this.state
        let sorterField = ""
        if (sorter.field === "company_name") {
            sorterField = "e.company_name";
        } else if (sorter.field === "worker_name") {
            sorterField = "h.user_full_name";
        } else if (sorter.field === "resolution_time") {
            sorterField = "f.sla_resolution_time";
        } else if (sorter.field === "start_job") {
            sorterField = "g.start_job";
        } else {
            sorterField = sorter.field;
        }

        let orderBy = "created_on,desc";
        if (sorter.order === "ascend") {
            orderBy = `${sorterField},asc`;
        } else if (sorter.order === "descend") {
            orderBy = `${sorterField},desc`;
        }
        this.setState({
            orderBy: orderBy
        }, () => {
            if (filterBy === 'lucy' || filterBy === '') {
                this.getTicketListSearch(search, pagination.current, pagination.pageSize, orderBy)
            } else {
                this.getTicketListSearchStatus(filterBy, search, pagination.current, pagination.pageSize, orderBy)
            }
        })

    }

    // get view TroubleTicketById & Add geofencing from data row listTroubleTicket
    async getTroubleTicketById(id, geofencing) {
        await FSMServices.getTroubleTicketById(id).then(res => {
            let troubleTicketById = res ? res.data.Data : [];
            this.setState({
                troubleTicketById: {
                    ticketId: troubleTicketById.ticketId,
                    ticketCode: troubleTicketById.ticketCode,
                    ticketTitle: troubleTicketById.ticketTitle,
                    companyId: troubleTicketById.companyId.companyId,
                    branchId: troubleTicketById.branchId,
                    priorityId: troubleTicketById.priorityId,
                    reportId: troubleTicketById.reportId,
                    slaId: troubleTicketById.slaId,
                    picId: troubleTicketById.picId,
                    ticketDate: troubleTicketById.ticketDate,
                    ticketTime: troubleTicketById.ticketTime,
                    categoryId: troubleTicketById.categoryId,
                    ticketDurationTime: troubleTicketById.ticketDurationTime,
                    ticketDueDate: troubleTicketById.ticketDueDate,
                    jobId: troubleTicketById.jobId,
                    jobCategoryId: troubleTicketById.jobCategoryId.jobCategoryId,
                    jobClassId: troubleTicketById.jobCategoryId.jobClassId.jobClassId,
                    ticketDescription: troubleTicketById.ticketDesc,
                    fileName: troubleTicketById.fileName,
                    filePath: troubleTicketById.filePath,
                    geofencing: geofencing,
                    referenceTicketCode: troubleTicketById.referenceTicketCode
                },
            }, () => {
                this.setState({
                    loadingUpdateTicket: true
                })
                FSMServices.getBranchByCompany(troubleTicketById.companyId.companyId).then(resultCompany => {
                    this.setState({
                        branchByCompanyUpdate: resultCompany ? resultCompany.data.Data : [],
                        loadingUpdateTicket: false
                    })
                })
                FSMServices.getPICByCompany(troubleTicketById.branchId).then(resultBranch => {
                    this.setState({
                        picByCompanyUpdate: resultBranch ? resultBranch.data.Data : [],
                        loadingUpdateTicket: false
                    })
                })
                // FSMServices.getJobCategoryByClass(troubleTicketById.jobCategoryId.jobClassId.jobClassId).then( resultClass => {
                //     this.setState({
                //         categoryByClassUpdate: resultClass ? resultClass.data.Data : [],
                //         loadingUpdateTicket: false
                //     })
                // })
                // FSMServices.getJobByCategory(troubleTicketById.jobCategoryId.jobCategoryId).then( resCategory => {
                //     this.setState({
                //         jobByCategoryUpdate: resCategory ? resCategory.data.Data : [],
                //         loadingUpdateTicket: false
                //     })
                // })
            });
            if (res ? res.status === 200 : false) {
                this.setState({
                    visibleUpdate: true,
                    loadingUpdateTicket: false
                })
            }
        });

    }

    deleteTicket = (idParams) => {
        let loading = this.state.loadingDelete
        const { search, filterBy, orderBy } = this.state
        loading[idParams] = true
        this.setState({ loadingDelete: loading });
        let dataDeleted = {
            lastModifiedBy: this.state.userIdAkun
        }
        FSMServices.deleteTicket(dataDeleted, idParams).then(res => {
            if (res ? res.status === 200 : false) {
                if (res.data.Status === 'OK') {
                    notification.success({
                        placement: 'bottomRight',
                        message: 'Success',
                        description: res.data.Message ? res.data.Message : 'Delete Ticket Success',
                    });
                    if (filterBy === 'lucy' || filterBy === '') {
                        this.getTicketListSearch(search, 1, 10, orderBy)
                    } else {
                        this.getTicketListSearchStatus(filterBy, search, 1, 10, orderBy)
                    }
                    this.setState({
                        visibleDelete: false,
                        deleteId: null
                    })
                } else {
                    notification.error({
                        placement: 'bottomRight',
                        message: 'Error',
                        description: res.data.Message ? res.data.Message : 'Delete Ticket Failed'
                    });
                }
            } else {
                notification.error({
                    placement: 'bottomRight',
                    message: 'Error',
                    description: res.data.Message ? res.data.Message : 'Delete Ticket Failed'
                });
            }
            loading[idParams] = false
            this.setState({ loadingDelete: loading });
        })
    }

    handleModalDetailClose = () => {
        this.setState({ visibleDetail: false });
    }

    donwloadAssignmentLetter = (fileName) => {
        this.setState({ loadingAssignmentLetter: true });
        FSMServices.donwloadAssignmentLetter(fileName).then(res => {
            this.setState({
                link: res && res.data ? res.data.Link : "",
                loadingAssignmentLetter: false,
            }, () => {
                this.link.current.click();
            })
        });
    }

    // Create Dispatch
    async createDispatch(data, workerId) {
        const { search, filterBy, orderBy } = this.state
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
                    if (filterBy === 'lucy' || filterBy === '') {
                        this.getTicketListSearch(search, 1, 10, orderBy)
                    } else {
                        this.getTicketListSearchStatus(filterBy, search, 1, 10, orderBy)
                    }
                    this.setState({
                        visibleAssignDispatch: false,
                        visibleSetTime: false,
                        visibleDetail: false
                    });
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

    handleModalSetTime = (ticketId, jobId) => {
        this.setState({
            visibleDetailTL: false,
            visibleSetTime: !this.state.visibleSetTime,
            createDispatchTicketId: ticketId,
            createDispatchJobId: jobId,
            checkedSecondaryArea: false,
            checkedTechnician: false
        });
    }

    handleModalSetTimeClose() {
        this.setState({
            visibleSetTime: false,
            loadingCreateDispatch: true,
            checkedSecondaryArea: false,
            checkedTechnician: false
        })
    }

    handleCancelTicketModal = (id) => {
        this.setState({
            visibleCancel: !this.state.visibleCancel,
            idTicket: id
        })
    }

    handleCancelTicket = value => {
        const { search, filterBy, orderBy } = this.state
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
                    if (filterBy === 'lucy' || filterBy === '') {
                        this.getTicketListSearch(search, 1, 10, orderBy)
                    } else {
                        this.getTicketListSearchStatus(filterBy, search, 1, 10, orderBy)
                    }
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

    reopenTicket = async (record) => {
        let { loadingReopen, search, filterBy, orderBy } = this.state;
        loadingReopen[record.key] = true;
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
                        this.getTicketListSearch(search, 1, 10, orderBy)
                    } else {
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

        loadingReopen[record.key] = false;
        this.setState({ loadingReopen });
    }

    handleReopenTicketModal = (id) => {
        this.setState({
            visibleReopen: !this.state.visibleReopen,
            idTicketReopen: id
        })
    }

    handleReopenTicket = async value => {
        const { idTicketReopen, search, filterBy, orderBy } = this.state
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
                if (filterBy === 'lucy' || filterBy === '') {
                    this.getTicketListSearch(search, 1, 10, orderBy)
                } else {
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
        const {
            loading,
            listTicket,
            pagination,
            dataSLA,
            dataPriority,
            dataReport,
            loadingDelete,
            filterBy,
            statusTicket,
            optionListJob,
            dataPic,
            search,
            accessRight,
            dashboard,
            optionListRefTicket,
            isDisabledBranch
        } = this.state
        const optionsListJob = optionListJob.map((item, index) => {
            return <Select.Option key={item.jobId + 'job' + index} value={item.jobId}>{item.jobName}</Select.Option>
        })

        const optionsListRefTicket = optionListRefTicket.map((item, index) => {
            return <Select.Option key={item.ticketCode + 'refTicket' + index} value={item.ticketCode}>{item.ticketCode}</Select.Option>
        })
        let paginationCus = { ...pagination, showSizeChanger: false }
        const columns = [
            {
                width: 1,
                render: record => {
                    if (record.ticket_status_id === 'Open' && accessRight.includes('Delete')) {
                        return (
                            <Popconfirm
                                title="Are you sure?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => this.deleteTicket(record.ticket_id)}
                            >
                                <Button
                                    className="btn-delete"
                                    type="danger"
                                    icon={<CloseOutlined />}
                                    size={'middle'}
                                    loading={loadingDelete[record.ticket_id]}
                                />
                            </Popconfirm>
                        )
                    }
                }
            },
            {
                title: 'Ticket ID',
                dataIndex: 'ticket_code',
                key: 'ticket_code',
                sorter: true,
                render: ticket_code => <Text style={{ color: 'blue', cursor: 'pointer' }} >{ticket_code}</Text>,
                onCell: record => {
                    return {
                        onClick: () => {
                            this.handleModalDetail(record.ticket_id, record.jobId, record.ticket_status_id)
                        }
                    }
                }
            },
            {
                title: 'Ref. Ticket ID',
                dataIndex: 'reference_ticket_code',
                key: 'reference_ticket_code',
                sorter: true,
                render: reference_ticket_code => <Text style={{ color: (reference_ticket_code != "-") ? 'blue' : 'black', cursor: (reference_ticket_code != "-") ? 'pointer' : '' }} >{reference_ticket_code}</Text>,
                onCell: record => {
                    return {
                        onClick: () => {
                            this.handleModalDetail(record.reference_ticket.ticketId, record.reference_ticket.jobId, record.reference_ticket.ticketStatus)
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
                title: 'Worker',
                dataIndex: 'worker_name',
                key: 'h.user_full_name',
                sorter: true
            },
            {
                title: 'Customer',
                dataIndex: 'company_name',
                key: 'e.company_name',
                sorter: true
            },
            {
                title: 'Start Job',
                dataIndex: 'start_job',
                key: 'g.start_job',
                sorter: true,
                align: 'center'
            },
            {
                title: 'Resolution Time',
                dataIndex: 'resolution_time',
                key: 'resolutionTime',
                sorter: false,
                align: 'center'
            },
            {
                title: 'Status',
                dataIndex: 'ticket_status_id',
                sorter: true,
                key: 'ticket_status_id',
                render: ticket_status_id => {
                    if (ticket_status_id.toLowerCase() === "open") {
                        return (
                            <Tag color="green">{ticket_status_id}</Tag>
                        )
                    } else if (ticket_status_id.toLowerCase() === "dispatch") {
                        return (
                            <Tag color="blue">{ticket_status_id}</Tag>
                        )
                    } else if (ticket_status_id.toLowerCase() === "cancel") {
                        return (
                            <Tag color="red">{ticket_status_id}</Tag>
                        )
                    } else {
                        return (
                            <Tag >{ticket_status_id}</Tag>
                        )
                    }
                },
                align: 'center'
            },
            {
                width: 1,
                render: record => (
                    <div>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            size={'middle'}
                            onClick={() => {
                                this.donwloadAssignmentLetter(record.file_name);
                            }}
                            disabled={record.file_name ? false : true}
                        />
                        <a ref={this.link} href={this.state.link}>
                            <span
                                className="link-import"
                                style={{
                                    marginLeft: 20
                                }}
                                hidden
                            >
                                Download Assignment letter
                            </span>
                        </a>
                    </div>
                )
            },
            {
                width: 1,
                render: record => (
                    <div>
                        { (record.ticket_status_id === 'Cancel' && accessRight.includes('Re-Open')) ?
                            <Popconfirm
                                title="Are you sure?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => (record.ticket_status_id === 'Cancel') ? this.reopenTicket(record) : this.handleReopenTicketModal(record.ticket_id)}
                            >
                                <Button
                                    className="button-confirm"
                                    type="primary"
                                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                                    loading={this.state.loadingReopen[record.ticket_id]}>
                                    Re-Open
                            </Button>
                            </Popconfirm>
                            : ((record.ticket_status_id === 'Dispatch' || record.ticket_status_id === 'Finish Reported') && accessRight.includes('Re-Open')) ?
                                <Button
                                    className="button-confirm"
                                    type="primary"
                                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                                    loading={this.state.loadingReopenTicket}
                                    onClick={() => this.handleReopenTicketModal(record.ticket_id)}>
                                    Re-Open
                          </Button>
                                : <div>
                                    {accessRight.includes('Cancel') ?
                                        <Button
                                            type='primary'
                                            danger
                                            disabled={record.ticket_status_id === 'Open' ? false : true}
                                            loading={this.state.loadingCancel}
                                            onClick={() => this.handleCancelTicketModal(record.ticket_id)}
                                        >
                                            Cancel
                            </Button>
                                        : <></>
                                    }
                                </div>
                        }
                    </div>
                ),
                align: 'center'
            },
            {
                width: 1,
                render: record => {
                    if (record.ticket_status_id === 'Open' && accessRight.includes('Update')) {
                        return (
                            <Button
                                className="btn-edit"
                                icon={<EditFilled />}
                                size={'middle'}
                                onClick={() => {
                                    this.getTroubleTicketById(record.ticket_id, record.geofencing);
                                }}
                            />
                        )
                    }
                }
            },
        ];
        return (
            <Content className="content">
                { accessRight.includes('Read') || accessRight == "" ?
                    <div>
                        <Row
                            style={{
                                marginBottom: '15px'
                            }}
                        >
                            <Col md={12}>
                                <Space size={20}>
                                    {(dashboard) ?
                                        <Avatar size="large" style={{ backgroundColor: 'red', background: '#27737D', cursor: 'pointer' }} icon={<LeftOutlined />} onClick={() => this.props.history.push('/dashboard')} />
                                        : <></>
                                    }

                                    <Title
                                        level={2}
                                        style={{
                                            display: 'inline-block',
                                            margin: '0'
                                        }}
                                    >
                                        Ticketing List
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
                                    <ModalTicket
                                        title="New Ticket"
                                        visible={this.state.visibleCreate}
                                        buttonCancel={this.handleModalCreate}
                                        customer={this.state.optionListCustomer}
                                        onChangeCustomer={e => this.onChangeCustomer(e)}
                                        subLocation={this.state.optionListBranchByCompany}
                                        onChangeSubLocation={e => this.onChangeSubLocation(e)}
                                        searchJob={val => this.searchJob(val)}
                                        dataSLA={dataSLA}
                                        dataPriority={dataPriority}
                                        dataReport={dataReport}
                                        pic={dataPic}
                                        job={optionsListJob}
                                        jobCategory={this.state.optionListJobCategoryByjobClass}
                                        onChangeJobCategory={e => this.onChangeJobCategory(e)}
                                        jobClass={this.state.optionListJobClass}
                                        onChangeJobClass={e => this.onChangeJobClass(e)}
                                        category={this.state.optionListCategory}
                                        duration={this.state.duration}
                                        onFinish={(values, fileName, filePath) => this.onFinishCreate(values, fileName, filePath)}
                                        onChangeDate={(date, dateString) => this.onChangeDate(date, dateString)}
                                        onChangeTime={(time, timeString) => this.onChangeTime(time, timeString)}
                                        refTicket={optionsListRefTicket}
                                        searchRefTicket={val => this.searchRefTicket(val)}
                                        isDisabledBranch={isDisabledBranch}
                                        loadingCreateTicket={this.state.loadingCreateUpdateTicket}
                                    />
                                    <ModalTicket
                                        title="Update Ticket"
                                        visible={this.state.visibleUpdate}
                                        buttonCancel={this.handleModalUpdate}
                                        dataEdit={this.state.troubleTicketById ? this.state.troubleTicketById : {}}
                                        customer={this.state.optionListCustomer}
                                        onChangeCustomer={e => this.onChangeCustomer(e)}
                                        subLocation={this.state.branchByCompanyUpdate}
                                        onChangeSubLocation={e => this.onChangeSubLocation(e)}
                                        dataSLA={dataSLA}
                                        isEdit={true}
                                        dataPriority={dataPriority}
                                        dataReport={dataReport}
                                        pic={this.state.picByCompanyUpdate}
                                        job={optionsListJob}
                                        jobCategory={this.state.categoryByClassUpdate}
                                        onChangeJobCategory={e => this.onChangeJobCategory(e)}
                                        jobClass={this.state.optionListJobClass}
                                        onChangeJobClass={e => this.onChangeJobClass(e)}
                                        category={this.state.optionListCategory}
                                        duration={this.state.duration}
                                        loading={this.state.loadingUpdateTicket}
                                        onChangeDate={(date, dateString) => this.onChangeDate(date, dateString)}
                                        onChangeTime={(time, timeString) => this.onChangeTime(time, timeString)}
                                        onFinish={(values, fileName, filePath) => this.onFinishEdit(values, fileName, filePath)}
                                        refTicket={optionsListRefTicket}
                                        searchRefTicket={val => this.searchRefTicket(val)}
                                        isDisabledBranch={isDisabledBranch}
                                        loadingCreateTicket={this.state.loadingCreateUpdateTicket}
                                    />
                                    <ModalTicket
                                        title="Detail Ticket"
                                        status={statusTicket}
                                        visible={this.state.visibleDetail}
                                        buttonCancel={() => this.handleModalDetailClose()}
                                        loading={this.state.detailLoading}
                                        buttonDispatch={() => this.handleModalSetTime(this.state.getDetailTicket.ticketId, this.state.createDispatchJobId)}
                                        dataTicket={this.state.getDetailTicket ? this.state.getDetailTicket : []}
                                        accessRight={accessRight}
                                    />
                                    <Modal
                                        title="Set Time"
                                        visible={this.state.visibleSetTime}
                                        handleChecked={this.state.checkedSecondaryArea}
                                        handleCheckedTechnician={this.state.checkedTechnician}
                                        buttonCancel={() => this.handleModalSetTimeClose()}
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
                                    <ModalTicket
                                        title="Cancel Ticket"
                                        visible={this.state.visibleCancel}
                                        buttonCancel={() => this.handleCancelTicketModal(this.state.idTicket)}
                                        loadingCancelTicket={this.state.loadingCancelTicket}
                                        onFinish={value => this.handleCancelTicket(value)}
                                    >
                                    </ModalTicket>
                                    <ModalTicket
                                        title="Reopen Ticket"
                                        visible={this.state.visibleReopen}
                                        buttonCancel={() => this.handleReopenTicketModal(this.state.idTicketReopen)}
                                        loadingReopenTicket={this.state.loadingReopenTicket}
                                        onFinish={value => this.handleReopenTicket(value)}
                                    >
                                    </ModalTicket>
                                </Space>
                            </Col>
                            <Col md={4} >
                                <Select className="select-dashboard select-ticketList" listHeight={288} value={filterBy} onChange={(val) => this.onChangeStatus(val)}>
                                    <Select.Option value="lucy">Status Filter</Select.Option>
                                    <Select.Option value="8" style={{ color: 'green' }}>Open</Select.Option>
                                    <Select.Option value="9" style={{ color: 'blue' }}>Dispatch</Select.Option>
                                    <Select.Option value="10" style={{ color: 'green' }}>Inprogress</Select.Option>
                                    <Select.Option value="11" style={{ color: 'orange' }}>Hold</Select.Option>
                                    <Select.Option value="12" style={{ color: 'blue' }}>Finish</Select.Option>
                                    <Select.Option value="13" style={{ color: 'red' }}>Cancel</Select.Option>
                                    <Select.Option value="30" style={{ color: 'yellow' }}>Finish Reported</Select.Option>
                                    <Select.Option value="45" style={{ color: '#d742f5' }}>Confirm Reported</Select.Option>
                                </Select>
                            </Col>
                            <Col md={8} style={{ textAlign: 'right' }}>
                                <Input
                                    className="input-search"
                                    placeholder="Search.."
                                    value={search}
                                    onChange={(e) => this.searchChange(e)}
                                    style={{
                                        // width: '250px',
                                        maxWidth: '90%',
                                        marginRight: '10px'
                                    }}
                                    prefix={<SearchOutlined />}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Card
                                    bordered={false}
                                    className="card-master-data"
                                >
                                    <Table
                                        size="middle"
                                        columns={columns}
                                        dataSource={listTicket}
                                        pagination={paginationCus}
                                        loading={loading}
                                        onChange={(page, filters, sorter) => this.handleTableChange(page, filters, sorter)}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    : <PermissionDenied />
                }
            </Content>
        );
    }
}

export default withRouter(TicketingList);
