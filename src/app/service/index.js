import axios from "axios";
import config from "./Config";
import configNoProxy from "./Config/noProxy";
import Swal from "sweetalert2";
import moment from 'moment';
import Cookies from 'js-cookie'

const alert = {
    showAlert(message) {
        Swal.fire({
            type: "error",
            text: message,
            animation: false,
            allowOutsideClick: false,
            customClass: {
                popup: "animated tada"
            }
        }).then(result => {
            if (result.value) {
                window.location.reload();
            }
        });
    }
};

const now = moment();
const fow = now.day() - 1;
const eow = 6 - fow;
const firstday = moment().subtract(fow, "days").format("YYYY-MM-DD");
const lastday = moment().add(eow, "days").format("YYYY-MM-DD");
const year = now.format('YYYY');
const month = now.format('MM');
const dayOfMonth = moment().daysInMonth();
const firstDayofMonth = moment(year + "-" + month + "-01").format('YYYY-MM-DD')
const lastDayofMonth = moment(year + "-" + month + "-" + dayOfMonth).format('YYYY-MM-DD')
const client = axios.create(config.api);
const clientNoProxy = axios.create(configNoProxy.api);
const clientForLogin = axios.create(config.login);
const roleId = Cookies.get('roleId');
console.log('roleId : ', roleId);
// Request interceptor
client.interceptors.request.use(
    async function (configuration) {
        const token = Cookies.get("LoginSession");
        if (token !== null) {
            configuration.headers.Authorization = `Bearer ${token}`;
        }

        return configuration

        // if (Cookies.get('lastModifiedOn') && Cookies.get('roleId')) {
        //     const valid = await axios(
        //         {
        //             method: 'get',
        //             url: `${config.api.baseURL}/users/${Cookies.get('userId')}`,
        //             headers: { 'Authorization': 'Bearer ' + Cookies.get('LoginSession') },
        //         },
        //         { crossdomain: true }
        //     )
        //         .then(function (res) {
        //             if (res.status == 200 && res.data && res.data.Data && Cookies.get('lastModifiedOn') && Cookies.get('roleId') && (Cookies.get('lastModifiedOn') !== res.data.Data.roleId.lastModifiedOn || Cookies.get('roleId') != res.data.Data.roleId.roleId)) {
        //                 Cookies.remove('LoginSession', { path: '' })
        //                 // if (!res.data.Data.approved) {
        //                 //   sessionStorage.setItem('title','Your account has banned')
        //                 //   alert.showAlert("Your account has banned", "Your account has banned");
        //                 // } else if (Cookies.get('lastModifiedOn') !== res.data.Data.roleId.lastModifiedOn || Cookies.get('roleId') != res.data.Data.roleId.roleId) {
        //                 sessionStorage.setItem('title', 'Role has been changes')
        //                 alert.showAlert("Role has been changes", "Role has been changes");
        //                 // }
        //                 return false
        //             } else {
        //                 return true
        //             }
        //         })
        //
        //     if (valid)
        //         return configuration
        // } else {
        //     return configuration
        // }
    },
    function (err) {
        throw new Error(err);
    }
);

// Response interceptor
client.interceptors.response.use(
    response => response,
    error => {
        console.log("Error Message : ", error);
        let err = error.toString();
        if (err.includes("504")) {
            alert.showAlert("Connection time out", "Reload");
        } else if (err.includes("401")) {
            if (sessionStorage.getItem('title')) {
                alert.showAlert(sessionStorage.getItem('title'), sessionStorage.getItem('title'));
            } else {
                Cookies.remove('LoginSession', { path: '' })
                alert.showAlert("Unauthorized", "Unauthorized");
            }
        } else if (err.includes("500")) {
            alert.showAlert("Internal server error", "Reload");
        } else if (err.includes("Network Error", "Reload")) {
            alert.showAlert("Network Error");
        }
    }
);

// Response interceptor
clientNoProxy.interceptors.response.use(
    response => response,
    error => {
        console.log("Error Message : ", error);
        let err = error.toString();
        if (err.includes("504")) {
            alert.showAlert("Connection time out", "Reload");
        } else if (err.includes("500")) {
            alert.showAlert("Internal server error", "Reload");
        } else if (err.includes("Network Error", "Reload")) {
            alert.showAlert("Network Error");
        }
    }
);

clientForLogin.interceptors.response.use(
    response => response,
    error => {
        console.log("Error Message : ", error);
        let err = error.toString();
        if (err.includes("504")) {
            alert.showAlert("Connection time out", "Reload");
        } else if (err.includes("500")) {
            alert.showAlert("Internal server error", "Reload");
        } else if (err.includes("Network Error", "Reload")) {
            alert.showAlert("Network Error");
        }
    }
);

const FSMServices = {
    // authentication
    authenticationLogin(data) {
        return clientForLogin.request(
            {
                method: "post",
                url: `/login`,
                data
            },
            { crossdomain: false }
        );
    },
    register(data) {
        return clientNoProxy.request(
            {
                method: "post",
                url: `${configNoProxy.api.baseURL}/users/register`,
                data
            },
            { crossdomain: false }
        );
    },
    getDataAkun(id) {
        return client.request(
            {
                method: "get",
                url: `/users/${id}`,
            },
            { crossdomain: true }
        );
    },
    postFirebaseToken(params) {
        var data = {
            tokens: params.fcmToken
        }

        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/users/token?userId=${params.userId}`,
                data
            },
            { crossdomain: true }
        );
    },
    getOptionListRoleRegister() {
        return clientNoProxy.request(
            {
                method: "get",
                url: `/role/readAll?skip=&top=&orderby&filter=is_deleted=false`
            },
            { crossdomain: true }
        )
    },
    forgetPassword(data) {
        return clientNoProxy.request(
            {
                method: "put",
                url: `${configNoProxy.api.baseURL}/api/forgotPassword`,
                data
            }
        )
    },
    getUserById(username) {
        return clientNoProxy.request(
            {
                method: "get",
                url: `${configNoProxy.api.baseURL}/users/readAll?skip=&top=&orderby&filter=userName='${username}'`
            }
        )
    },
    getAllCity() {
        return clientNoProxy.request(
            {
                method: "get",
                url: `${configNoProxy.api.baseURL}/cityRepo/City/all`
            },
            { crossdomain: true }
        )
    },
    getUserIdentity() {
        return clientNoProxy.request(
            {
                method: "get",
                url: `${configNoProxy.api.baseURL}/code/userIdentity`
            },
            { crossdomain: true }
        )
    },
    // END

    // Dashboard
    getTicketOpen(sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicketOpen?sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getTicketOpenDetail(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/detailTicket/${id}`
            },
            { crossdomain: true }
        )
    },
    getTicketFinish(sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllFinishedOrder?size=10&search=&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getDetailFinishOrder(orderId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/detailFinishOrder/${orderId}`
            },
            { crossdomain: true }
        )
    },
    getTicketConfirmReported(sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllConfirmReportedOrder?size=10&search=&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getDetailConfirmReportedOrder(orderId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/detailConfirmReportedOrder/${orderId}`
            },
            { crossdomain: true }
        )
    },
    getTicketCancel(search, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/getAllCanceledTicket?search=${search}&page=0&size=10&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getDetailTicketCancel(ticketId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/detailCanceledTicket/${ticketId}`
            },
            { crossdomain: true }
        )
    },
    reopenTicket(ticketId, data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/troubleTicket/reOpen/${ticketId}`,
                data
            },
            { crossdomain: true }
        )
    },
    reopenTicketDispatch(ticketId, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/troubleTicket/reOpenTicket/${ticketId}`,
                data
            },
            { crossdomain: true }
        )
    },
    getDispatchList(data) {
        let params = {
            keyword: data.keyword,
            page: data.page,
            size: data.size,
            sort: data.sort
        }
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listDispatch?search=${params.keyword}&page=${params.page - 1}&size=${params.size}&sort=${params.sort}&userId=${Cookies.get('userId')}`,
                data
            },
            { crossdomain: true }
        )
    },
    getDispatchListFilterSearch(data) {
        let params = {
            filter: data.filter,
            keyword: data.keyword,
            page: data.page,
            size: data.size,
            sort: data.sort
        }
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listDispatchFilter?search=${params.keyword}&filter=${params.filter}&page=${params.page - 1}&size=${params.size}&sort=${params.sort}&userId=${Cookies.get('userId')}`,
                data
            },
            { crossdomain: true }
        )
    },
    getDetailDispatch(orderId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/Dispatch/detailDispatch/${orderId}`
            },
            { crossdomain: true }
        )
    },
    getDetailHistoryDispatch(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/listHistoryDispatch?ticketId=${id}&sort=created_on,desc`
            },
            { crossdomain: true }
        )
    },
    getSearchDispatch(params) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listDispatchSearch?page=${params.page}&search=${params.keyword}`
            },
            { crossdomain: true }
        )
    },
    createDispatch(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/Dispatch/create`,
                data
            },
            { crossdomain: true }
        )
    },
    getAllWorkerForDispatch(ticketId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/worker_repo/getAllWorkerForDispatch?ticketId=${ticketId}`
            },
            { crossdomain: true }
        )
    },
    getAllWorkerForDispatchNew(ticketId, jobId, dispatchDate, dispatchTime, period, showAllWorker) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listWorkerForDispatch?userId=${Cookies.get('userId')}&dispatchDate=${dispatchDate}&dispatchTime=${dispatchTime}&ticketId=${ticketId}&jobId=${jobId}&startDate=${period === 'today' ? moment(new Date()).format('YYYY-MM-DD') : period === 'week' ? moment(firstday).format('YYYY-MM-DD') : moment(firstDayofMonth).format('YYYY-MM-DD')}&endDate=${period === 'today' ? moment(new Date()).format('YYYY-MM-DD') : period === 'week' ? moment(lastday).format('YYYY-MM-DD') : moment(lastDayofMonth).format('YYYY-MM-DD')}&showAllWorker=${showAllWorker}`
            },
            { crossdomain: true }
        )
    },
    getAllWorkerForDispatchBoth(ticketId, jobId, dispatchDate, dispatchTime, period, showAllWorker) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listWorkerForDispatchBoth?userId=${Cookies.get('userId')}&dispatchDate=${dispatchDate}&dispatchTime=${dispatchTime}&ticketId=${ticketId}&jobId=${jobId}&startDate=${period === 'today' ? moment(new Date()).format('YYYY-MM-DD') : period === 'week' ? moment(firstday).format('YYYY-MM-DD') : moment(firstDayofMonth).format('YYYY-MM-DD')}&endDate=${period === 'today' ? moment(new Date()).format('YYYY-MM-DD') : period === 'week' ? moment(lastday).format('YYYY-MM-DD') : moment(lastDayofMonth).format('YYYY-MM-DD')}&showAllWorker=${showAllWorker}`
            },
            { crossdomain: true }
        )
    },

    getStatusTicket(params) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/totalStatusTicket?period=${params}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getChartDispatch(year) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/chartDispatch?year=${year}&userId=${Cookies.get('userId')}`
            }
        )
    },
    getNumberOfTicket(year, month) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/numberOfTicket?year=${year}&month=${month}&userId=${Cookies.get('userId')}`
            }
        )
    },
    getSolvingTime() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/avgSolvingTime?period=1&userId=${Cookies.get('userId')}`
            }
        )
    },
    getTicketPriority() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/ticketBaseOnPriority?period=3&userId=${Cookies.get('userId')}`
            }
        )
    },
    getFinishOrderSearch(search, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllFinishedOrder?size=10&search=${search}&sort=${sort}&userId=${Cookies.get('userId')}`
            }
        )
    },
    getFinishOrderFilter(filter, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllFinishedOrderFilter?size=10&filter=${filter}&sort=${sort}&userId=${Cookies.get('userId')}`
            }
        )
    },
    getFinishOrderSearchFilter(filter, search, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllFinishedOrderFilter?size=10&filter=${filter}&search=${search}&sort=${sort}&userId=${Cookies.get('userId')}`
            }
        )
    },
    getConfirmReportedOrderSearch(search, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllConfirmReportedOrder?size=10&search=${search}&sort=${sort}&userId=${Cookies.get('userId')}`
            }
        )
    },
    getConfirmReportedOrderFilter(filter, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllConfirmReportedOrderFilter?size=10&filter=${filter}&search=&sort=${sort}&userId=${Cookies.get('userId')}`
            }
        )
    },
    getConfirmReportedOrderSearchFilter(filter, search, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/getAllConfirmReportedOrderFilter?size=10&filter=${filter}&search=${search}&sort=${sort}&userId=${Cookies.get('userId')}`
            }
        )
    },

    getPriority() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/code/priority`
            }
        )
    },

    getReport() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listReport`
            }
        )
    },

    getSLAOptions() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/SLA/listSLAWithBranchId?userId=${Cookies.get('userId')}`
            }
        )
    },

    // End

    // Ticketing List
    getTicketList(data) {
        let params = {
            keyword: data.keyword,
            page: data.page,
            size: data.size,
            orderBy: data.orderBy
        }
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicket?search=${params.keyword}&page=${params.page - 1}&size=${params.size}&sort=${params.orderBy}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getTicketListFilter(data) {
        let params = {
            filter: data.filter,
            keyword: data.keyword,
            page: data.page,
            size: data.size,
            orderBy: data.orderBy
        }
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicketFilter?search=${params.keyword}&filter=${params.filter}&page=${params.page - 1}&size=${params.size}&sort=${params.orderBy}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getOptionListCustomer() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listClientCompany?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getOptionListBranch(companyId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listClientCompanyBranch?userId=${Cookies.get('userId')}&companyId=${companyId}`
            },
            { crossdomain: true }
        )
    },
    getOptionListSLAType() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/SLA/getAllListSLAIncludeTypeName`
            },
            { crossdomain: true }
        )
    },
    getOptionListPIC() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listClientCompanyPIC`
            },
            { crossdomain: true }
        )
    },
    searchGetListJob(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/job_repo/listJob/?search=${search}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    searchGetListRefTicket(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listReferenceTicket?search=${search}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getOptionListJob(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/job_repo/getListJob?userId=${Cookies.get('userId')}&search=${search}`
            },
            { crossdomain: true }
        )
    },
    getOptionListJobCategory() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/jobCategory_repo/listJobCategory?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getOptionListJobClass() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/jobClass_repo/listJobClass?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getOptionListExistingReport() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listFields`
            },
            { crossdomain: true }
        )
    },


    getReportByJobCategory(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listReports/?id=${id}`
            }
        )
    },

    getReportById(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/jobCategory_repo/jobCategoryReport/${id}`
            }
        )
    },

    //new
    getListChildField(fieldJobCategoryId, fieldOptionParentId, pageNo, pageSize) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listFieldLov?fieldJobCategoryId=${fieldJobCategoryId}&fieldOptionParentId=${fieldOptionParentId}&search=&pageNo=${pageNo}&pageSize=${pageSize}`
            }
        )
    },

    getOptionListCategory() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/code/category`
            },
            { crossdomain: true }
        )
    },
    createTicket(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/troubleTicket/create`,
                data
            },
            { crossdomain: true }
        )
    },
    getDetailTicket(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/detailTicket/${id}`
            },
            { crossdomain: true }
        )
    },
    getTicketOnCancelList(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicketCancel?search=${search}&page=${page - 1}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getTroubleTicketById(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/updateDetailTicket/${id}`
            },
            { crossdomain: true }
        )
    },
    editTicket(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/troubleTicket/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteTicket(data, id) {
        return client.request(
            {
                method: 'put',
                url: `${config.api.baseURL}/troubleTicket/delete/${id}`,
                data
            }
        )
    },
    cancelTicket(data, id) {
        return client.request(
            {
                method: 'put',
                url: `${config.api.baseURL}/troubleTicket/cancel/${id}`,
                data
            }
        )
    },
    getBranchByCompany(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listBranchByCompanyId?companyId=${id}`
            },
            { crossdomain: true }
        )
    },
    getPICByCompany(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listPICByBranchId?branchId=${id}`
            },
            { crossdomain: true }
        )
    },
    getJobByCategory(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/job_repo/listJobByJobCategory?jobCategoryId=${id}`
            },
            { crossdomain: true }
        )
    },
    getJobCategoryByClass(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/jobCategory_repo/listJobCategoryByJobClass?jobClassId=${id}`
            },
            { crossdomain: true }
        )
    },
    getHoldTicketId(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/History/detailHoldReason/${id}`
            },
            { crossdomain: true }
        )
    },
    getNoteTicketId(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listDispatchNote?ticketId=${id}&sort=created_on,desc`
            },
            { crossdomain: true }
        )
    },
    // End

    // Finsihed order list

    getTicketOnFinish(search, page, size, order) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicketFinish?search=${search}&page=${page - 1}&size=${size}&sort=${order}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getTicketOnFinishFilter(search, filter, page, size, order) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicketFinishFilter?filter=${filter}&search=${search}&page=${page - 1}&size=${size}&sort=${order}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    confirmReport(ticketId, data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/troubleTicket/confirm/${ticketId}`,
                data
            },
            { crossdomain: true }
        )
    },
    // End

    // Confirm Reported order list
    getTicketOnConfirmReported(search, page, size, order) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicketConfirmReported?search=${search}&page=${page - 1}&size=${size}&sort=${order}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getTicketOnConfirmReportedFilter(search, filter, page, size, order) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/troubleTicket/listTroubleTicketConfirmReportedFilter?filter=${filter}&search=${search}&page=${page - 1}&size=${size}&sort=${order}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    // End


    // Monitoring

    getTechnicianAvaibility() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getDataWorkerAvaibility?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },

    getTechnicianStatus() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getDataTechnicianOnMonitoring?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },

    getTechnicianWorkerStandBy(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getDataTechnicianStandbyOnMonitoring?search=${search}&page=${page - 1}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },

    downloadCSVStandBy() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/monitoring/standbyList/csv/tes_csv?userId=${Cookies.get('userId')}`,
            },
            { crossdomain: true }
        )
    },

    downloadExcelStandBy() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/monitoring/standbyList/excel/tes?userId=${Cookies.get('userId')}`,
            },
            { crossdomain: true }
        )
    },

    downloadPDFStandBy() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/monitoring/standbyList/pdf/tes_pdf26?userId=${Cookies.get('userId')}`,
            },
            { crossdomain: true }
        )
    },

    getTechnicianPosition() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getLocationTechnician?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },

    // End

    // Schedule
    //Faisal
    getAllDataSchedule() {
        return client.request(
            {
                method: "GET",
                url: `${config.api.baseURL}/Dispatch/getDataSchedule?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },

    getDetailDataSchedule(orderId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/Dispatch/getDetailDataSchedule?orderid=${orderId}`
            },
            { crossdomain: true }
        )
    },

    // Dio
    getScheduleById(orderId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.noProxy}/Dispatch/ScheduleById?orderid=${orderId}`
            },
            { crossdomain: true }
        )
    },

    // End

    // Master Data UOM
    getUOMList(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/uom_repo/listUOM?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createUOM(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/uom_repo/UOM/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editUOM(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/uom_repo/UOM/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteUOM(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/uom_repo/UOM/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Report
    getReportList(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/getAllReport?search=${search}&page=${page}&size=${size}&sort=${sort}`
            },
            { crossdomain: true }
        )
    },
    createReport(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/report/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editReport(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/report/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteReport(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/report/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data SLA
    getSLAList(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/SLA/listSLA?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createSLA(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/SLA/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editSLA(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/SLA/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },

    deleteSLA(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/SLA/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },

    optionListCompany() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listClientCompany?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    optionListBranchByComapany(companyId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listClientCompanyBranch?userId=${Cookies.get('userId')}&companyId=${companyId}`
            },
            { crossdomain: true }
        )
    },
    optionListType() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/slaType/listSLAType`
            }
        )
    },
    optionListWorkingTime() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listWorkingTime?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    optionListCity() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/city/readAll?skip=&top=&orderby=&filter=isDeleted=false`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Job List
    getJobList(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/job_repo/job/all?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createJobList(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/job_repo/job/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editJobList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/job_repo/job/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteJobList(id, data) {
        return client.request(
            {
                method: 'put',
                url: `${config.api.baseURL}/job_repo/deleteJob?jobId=${id}`,
                data
            }
        )
    },
    // End

    // Master Data Job Class
    getJobClass(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/jobClass_repo/jobClass/all?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createJobClass(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/jobClass_repo/jobClass/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editJobClass(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/jobClass_repo/jobClass/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteJobClass(id, data) {
        return client.request(
            {
                method: 'put',
                url: `${config.api.baseURL}/jobClass_repo/deleteJobClass?jobClassId=${id}`,
                data
            }
        )
    },
    // End

    // Master Data Working Time
    createWorkingTime(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/workingTime/create`,
                data
            },
            { crossdomain: true }
        )
    },
    getWorkingTime(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listWTime?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    editWorkingTime(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/workingTime/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteWorkingTime(data, id) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/workingTime/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Job Category
    getJobCategory(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/jobCategory_repo/jobCategory/all?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createJobCategory(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/jobCategory_repo/jobCategory/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editJobCategory(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/jobCategory_repo/jobCategory/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteJobCategory(id, data) {
        return client.request(
            {
                method: 'put',
                url: `${config.api.baseURL}/jobCategory_repo/deleteJobCategory?jobCategoryId=${id}`,
                data
            }
        )
    },
    // End

    // Master Data Worker
    createWorker(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/users/createWorker`,
                data
            }
        )
    },
    getWorker(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/listWorker?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getOptionListWorkerGroup() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/user_group/readAll?skip=&top=&orderby=&filter=`
            },
            { crossdomain: true }
        )
    },
    getOptionListUserIdentity() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/code/readAll?skip=&top=&orderby&filter=isDeleted=false AND categorycodeid.categoryCodeId=10`
            },
            { crossdomain: true }
        )
    },
    // getOptionListJob() {
    //     return client.request(
    //         {
    //             method: "get",
    //             url: `${config.api.baseURL}/job/readAll?skip=&top=&orderby&filter=`
    //         },
    //         { crossdomain: true }
    //     )
    // },
    updateWorker(workerId, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/users/updateWorker/${workerId}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteWorker(workerId, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/users/deleteWorker/${workerId}`,
                data
            },
            { crossdomain: true }
        )
    },
    getWorkerDetail(workerId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getWorkerDetail/${workerId}`
            },
            { crossdomain: true }
        )
    },
    searchWorker(key) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getAllWorker/${key}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data User
    getUser(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/listUsers?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },

    createUser(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/users/createUsers`,
                data
            },
            { crossdomain: true }
        )
    },

    getUserRole(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listRoles/4?search=${search}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    updateUser(userId, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/users/updateUsers/${userId}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteUser(userId, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/users/deleteUsers/${userId}`,
                data
            },
            { crossdomain: true }
        )
    },
    getUserDetail(userId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getUserDetail/${userId}`
            },
            { crossdomain: true }
        )
    },
    searchUser(key) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/getAllUsers/${key}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Role List
    getRoleList(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listRole?search=${search}&page=${page}&size=${size}&sort=${sort}`
            },
            { crossdomain: true }
        )
    },
    getPrivilege() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listMenu`
            },
            { crossdomain: true }
        )
    },
    getRole(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/role/${id}`
            },
            { crossdomain: true }
        )
    },
    createRole(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/role/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editRole(roleId, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/role/update/${roleId}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteRole(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/role/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    getOptionListUserGroup() {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/userGroup/list`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Customer List
    getClientCompany(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/clientCompany?sort=${sort}&size=${size}&page=${page - 1}&search=${search}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createClientCompany(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/clientCompany/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editClientCompany(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/clientCompany/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteClientCompany(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/clientCompany/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    searchClientCompany(key, skip, top, orderBy) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/clientCompany/search?companyName=${key}&sort=${orderBy}&size=${top}&page=${skip}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Customer List Branch
    getClientCompanyBranch(search, page, size, sort) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/getAllClientCompanyBranch?search=${search}&page=${page - 1}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createClientCompanyBranch(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/createClientCompanyBranch`,
                data
            },
            { crossdomain: true }
        )
    },
    editClientCompanyBranch(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/updateClientCompanyBranch/${id}`,
                data
            },
            { crossdomain: true }
        )
    },

    deleteClientCompanyBranch(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/deleteClientCompanyBranch/${id}`,
                data
            },
            { crossdomain: true }
        )
    },

    getClientCompanyBranchPic(id) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/clientCompany/detail/${id}?userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },

    searchClientCompanyBranch(key, skip, top, orderBy) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/getAllClientCompanyBranch/${key}`
            },
            { crossdomain: true }
        )
    },

    // End

    // Import Service
    importTicket(userId, data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/submit/troubleTicket/${userId}`,
                data
            },
            { crossdomain: true }
        )
    },
    importCheckValidation(data) {
        const headers = {
            'Content-Type': ''
        }
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/import/troubleTicket?userId=${Cookies.get('userId')}`,
                data,
                headers
            },
            { crossdomain: true }
        )
    },
    // End

    // Upload Assignment Letter
    uploadAssignmentLetter(data) {
        const headers = {
            'Content-Type': ''
        }
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/uploadFile/`,
                data,
                headers
            },
            { crossdomain: true }
        )
    },
    donwloadAssignmentLetter(fileName) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/downloadFile/${fileName}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Action
    getActionList(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/action/all?search=${search}&page=${page}&size=${size}&sort=${sort}`
            },
            { crossdomain: true }
        )
    },
    createActionList(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/action/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editActionList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/action/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteActionList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/action/deleteAction?actionId=${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    searchActionList(key, skip, top, orderby) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/action/search?search=${key}&page=${skip}&size=${top}&sort=${orderby}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Failure
    getFailureList(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/failure/all?search=${search}&page=${page}&size=${size}&sort=${sort}`
            },
            { crossdomain: true }
        )
    },
    createFailureList(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/failure/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editFailureList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/failure/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteFailureList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/failure/deleteFailure?failureId=${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    searchFailureList(key, skip, top, orderby) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/failure/search?search=${key}&page=${skip}&size=${top}&sort=${orderby}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data City
    getCityList(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/cityRepo/City/all?search=${search}&page=${page}&size=${size}&sort=${sort}`
            },
            { crossdomain: true }
        )
    },
    createCityList(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/cityRepo/city/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editCityList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/cityRepo/city/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteCityList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/cityRepo/city/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Province
    getProvinceList(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listProvince?search=${search}&page=${page}&size=${size}&sort=${sort}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Master Data Diagnosis
    getDiagnosisList(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/diagnosis/all?search=${search}&page=${page}&size=${size}&sort=${sort}`
            },
            { crossdomain: true }
        )
    },
    createDiagnosisList(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/api/diagnosis/create`,
                data
            },
            { crossdomain: true }
        )
    },
    editDiagnosisList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/diagnosis/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteDiagnosisList(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/api/diagnosis/deleteDiagnosis?diagnosisId=${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    searchDiagnosisList(key, skip, top, orderby) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/diagnosis/search?search=${key}&page=${skip}&size=${top}&sort=${orderby}`
            },
            { crossdomain: true }
        )
    },
    // End

    // Export
    searchWorkerList(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/users/listUserWorker?page=0&size=10&search=${search}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    searchCityList(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/cityRepo/listCity?search=${search}`
            },
            { crossdomain: true }
        )
    },
    searchCompanyList(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/listCompany?page=0&size=10&search=${search}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getFilterExport(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/troubleTicket/exportListTicket`,
                data,
                params: {
                    sort: 'ticket_id,desc',
                    userId: Cookies.get('userId')
                }
            },
            { crossdomain: true }
        )
    },
    getWorkloadTask(page, size, sort, search, time) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/workload?userId=${Cookies.get('userId')}&time=${time}&pageNo=${page}&pageSize=${size}&sort=${sort}&search=${search}&startDate=${time === 'today' ? moment(new Date()).format('YYYY-MM-DD') : time === 'week' ? moment(firstday).format('YYYY-MM-DD') + `&endDate=${moment(lastday).format('YYYY-MM-DD')}` : moment(firstDayofMonth).format('YYYY-MM-DD') + `&endDate=${moment(lastDayofMonth).format('YYYY-MM-DD')}`}`
            },
            { crossdomain: true }
        )
    },
    getWorkloadCalendar(page, size, sort, search, time, date) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/workloadCalender?userId=${Cookies.get('userId')}&time=${time}&pageNo=${page}&pageSize=${size}&sort=${sort}&search=${search}&startDate=${time === 'today' ? moment(date).format('YYYY-MM-DD') : time === 'week' ? moment(firstday).format('YYYY-MM-DD') + `&endDate=${moment(lastday).format('YYYY-MM-DD')}` : moment(firstDayofMonth).format('YYYY-MM-DD') + `&endDate=${moment(lastDayofMonth).format('YYYY-MM-DD')}`}`
            },
            { crossdomain: true }
        )
    },
    getDetailWorkload(orderId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/workloadCalenderDetail/${orderId}`
            },
            { crossdomain: true }
        )
    },
    getDetailWorkloadWeek(workerId, date) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/api/workloadCalenderDetailWeek/${workerId}?date=${moment(date).format('YYYY-MM-DD')}`
            },
            { crossdomain: true }
        )
    },

    // Tenant
    getTenantList(page, size, sort, search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/mTenant/all?search=${search}&page=${page}&size=${size}&sort=${sort}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    createTenant(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/mTenant/create`,
                data
            },
            { crossdomain: true }
        )
    },
    updateTenant(id, data) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/mTenant/update/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    deleteTenant(id, data = { userId: Cookies.get('userId') }) {
        return client.request(
            {
                method: "put",
                url: `${config.api.baseURL}/mTenant/delete/${id}`,
                data
            },
            { crossdomain: true }
        )
    },
    getTenantLOV(search) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/mTenant/optionList?search=${search}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getListUserDetailOnTenant(search, page, size, sort, type, tenantId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/mTenant/detail/${tenantId}?search=${search}&page=${page}&size=${size}&sort=${sort}&filter=${type}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    getListUserAddMemberOnTenant(search, page, size, sort, type, tenantId) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/mTenant/addMember/${tenantId}?search=${search}&page=${page}&size=${size}&sort=${sort}&filter=${type}&userId=${Cookies.get('userId')}`
            },
            { crossdomain: true }
        )
    },
    updateMemberOnTenant(data) {
        return client.request(
            {
                method: "post",
                url: `${config.api.baseURL}/mTenant/addMember`,
                data
            },
            { crossdomain: true }
        )
    },
    getJobTenant(params) {
        return client.request(
            {
                method: "get",
                url: `${config.api.baseURL}/job_repo/getJobTenant?tenantId=${params.tenantId}&search=${params.search}`
            },
            { crossdomain: true }
        )
    },
};

export { FSMServices };
