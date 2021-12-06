import React from "react";
import { Modal, Typography, Button, Input, Space, Row, Col, Avatar, Card, Checkbox, Popconfirm, Rate, Carousel, Table, Tag, Spin, Select } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { FSMServices } from '../../service';
import moment from 'moment'
import FormCreateDispatch from './formCreateDispatch';

const { Title, Text } = Typography;
const { TextArea } = Input;
let codeHistory = ''
class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleHistory: false,
            visibleNote: false,
            visibleDispatch: false,
        }
    }

    handleModalHistory = (e, data) => {
        this.setState({ visibleHistory: !this.state.visibleHistory })
        if (e !== 'close') {
            codeHistory = data.ticketCode || ''
            this.getDetailHistoryDispatch(data.ticketId);
        }
    }

    handleModalDispatch = e => {
        this.setState({ visibleDispatch: !this.state.visibleDispatch })
    }

    async getDetailHistoryDispatch(id) {
        this.setState({
            loading: true
        });
        let data = [];
        await FSMServices.getDetailHistoryDispatch(id)
            .then(res => {
                data = res ? res.data.Data[0] : []
            })

        this.setState({
            listHistory: data.history.map(item => {
                var date = "";
                var _date = new Date(item.Date);
                if (_date.getDate() < 10) {
                    date += "0" + _date.getDate() + "/";
                } else {
                    date += _date.getDate() + "/";
                }
                if (_date.getMonth() < 10) {
                    date += "0" + (_date.getMonth() + 1) + "/";
                } else {
                    date += (_date.getMonth() + 1) + "/";
                }
                date += _date.getFullYear() + " ";
                if (_date.getHours() < 10) {
                    date += "0" + _date.getHours() + ":";
                } else {
                    date += (_date.getHours()) + ":";
                }
                if (_date.getMinutes() < 10) {
                    date += "0" + _date.getMinutes() + ":";
                } else {
                    date += (_date.getMinutes()) + ":";
                }
                if (_date.getSeconds() < 10) {
                    date += "0" + _date.getSeconds();
                } else {
                    date += (_date.getSeconds());
                }
                return {
                    key: `history${item.workerId}`,
                    status: item.dispatchStatus,
                    action: item.dispatchAction,
                    date: date,
                    reason: item.reason
                }
            })
        });

        this.setState({
            loading: false
        })
    }

    handleModalNote = (e, id) => {
        this.setState({
            visibleNote: !this.state.visibleNote
        })
        if (e !== 'close') {
            this.getDataNote(id)
        }
    }

    async getDataNote(id) {
        this.setState({
            loadingNote: true
        });
        let data = [];
        await FSMServices.getNoteTicketId(id).then(res => {
            data = res ? res.data.Data[0] : []
        })

        this.setState({
            listNote: data.dispatchNote.map(item => {
                var date = "";
                var _date = new Date(item.Date);
                if (_date.getDate() < 10) {
                    date += "0" + _date.getDate() + "/";
                } else {
                    date += _date.getDate() + "/";
                }
                if (_date.getMonth() < 10) {
                    date += "0" + (_date.getMonth() + 1) + "/";
                } else {
                    date += (_date.getMonth() + 1) + "/";
                }
                date += _date.getFullYear() + " ";
                if (_date.getHours() < 10) {
                    date += "0" + _date.getHours() + ":";
                } else {
                    date += (_date.getHours()) + ":";
                }
                if (_date.getMinutes() < 10) {
                    date += "0" + _date.getMinutes() + ":";
                } else {
                    date += (_date.getMinutes()) + ":";
                }
                if (_date.getSeconds() < 10) {
                    date += "0" + _date.getSeconds();
                } else {
                    date += (_date.getSeconds());
                }
                return {
                    date: date,
                    note: item.note
                }
            })
        });
        this.setState({
            loadingNote: false
        })
    }

    handleChange = (value) => {
        let type = value === 1 ? 'today' : value === 2 ? 'week' : 'month'
        this.props.handleChangePeriod(type)
    }

    handleConfirm = (record) => {
        this.props.confirmTicket(record)
    }

    handleReopen = (record) => {
        this.props.reopenTicket(record)
    }

    render() {
        const optionListPeriod = [
            {
                key: 1,
                name: 'Today'
            },
            {
                key: 2,
                name: 'This Week'
            },
            {
                key: 3,
                name: 'This Month'
            },
        ]
        return (
            <div>
                { this.props.title === "Set Time" ?
                    <Modal
                        visible={this.props.visible}
                        className="form-modal"
                        footer={null}
                        closable={false}
                        centered
                        width={360}
                    >
                        <Title level={4}>{this.props.title}</Title>
                        <FormCreateDispatch
                            onFinish={values => this.props.onFinish(values)}
                            visible={this.props.visible}
                            onChangeDate={this.props.onChangeDate}
                            onChangeTime={this.props.onChangeTime}
                            buttonCancel={this.props.buttonCancel}
                        />
                    </Modal>
                    : this.props.title === "Detail Dispatch" ?
                        <Modal
                            visible={this.props.visible}
                            className="form-modal"
                            footer={null}
                            closable={false}
                            centered
                            width={650}
                        >
                            <Spin spinning={this.props.loading} tip={'Loading'}>
                                <Row gutter={15}>
                                    <Col span={24}>
                                        <Title level={3}>{this.props.title} #{this.props.detailDispatch.ticketCode}</Title>
                                    </Col>
                                    {(this.props.detailDispatch.referenceTicketCode) ?
                                        <div>
                                            <Col span={24}>
                                                <Text><b>Ref. Ticket ID</b></Text>
                                            </Col>
                                            <Col span={24}>
                                                <Title className="body-detail" level={4}>{'#' + this.props.detailDispatch.referenceTicketCode}</Title>
                                            </Col>
                                        </div>
                                        : <></>
                                    }
                                    <Col span={24}>
                                        <Text><b>Title</b></Text>
                                    </Col>
                                    <Col span={24}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.ticketTitle}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>Customer</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>Branch</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.companyName}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.branchName}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>PIC</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>History</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.picName}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Text className="text-detail" style={{ fontSize: 12 }} onClick={() => this.handleModalHistory('detail', this.props.detailDispatch)}>SEE HISTORY</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>Worker</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text><b>Priority</b></Text>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.workerName}</Title>
                                    </Col>
                                    <Col span={12}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.priorityName}</Title>
                                    </Col>
                                    <Col span={24}>
                                        <Text><b>SLA</b></Text>
                                    </Col>
                                    <Col span={24}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.slaName}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Date</b></Text>
                                    </Col>
                                    <Col span={16}>
                                        <Text><b>Time</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.dispatchDate}</Title>
                                    </Col>
                                    <Col span={16}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.dispatchTime}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Category</b></Text>
                                    </Col>
                                    <Col span={16}>
                                        <Text><b>Duration (Hours)</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.ticketCategory}</Title>
                                    </Col>
                                    <Col span={16}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.ticketDurationTime}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Job Category</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Job Class</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text><b>Job</b></Text>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.jobCategoryName}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.jobClassName}</Title>
                                    </Col>
                                    <Col span={8}>
                                        <Title className="body-detail" level={4}>{this.props.detailDispatch.jobName}</Title>
                                    </Col>
                                    <Col span={24}>
                                        <Text><b>Description</b></Text>
                                    </Col>
                                    <Col span={24}>
                                        <TextArea rows={4} className="input-modal" value={this.props.detailDispatch.dispatchDesc}></TextArea>
                                    </Col>
                                    <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15 }}>
                                        <Space size={'small'}>
                                            <Button
                                                style={{
                                                    paddingLeft: '20px',
                                                    paddingRight: '20px',
                                                    borderRadius: '5px'
                                                }}
                                                onClick={() => this.handleModalNote('Open', this.props.detailDispatch.ticketId)}
                                            >
                                                Note
                                    </Button>
                                            <Button
                                                type="danger"
                                                style={{
                                                    paddingLeft: '20px',
                                                    paddingRight: '20px',
                                                    borderRadius: '5px'
                                                }}
                                                onClick={this.props.buttonCancel}
                                            >
                                                Close
                                    </Button>
                                        </Space>
                                    </Col>
                                </Row>
                            </Spin>
                        </Modal>
                        : this.props.title === "Detail Finish Order" ?
                            <Modal
                                visible={this.props.visible}
                                className="form-modal"
                                footer={null}
                                closable={false}
                                centered
                                width={900}
                            >
                                <Spin spinning={this.props.loading} tip={'Loading'}>
                                    <Row gutter={20}>
                                        <Col span={24}>
                                            <Row gutter={15}>
                                                <Col span={24}>
                                                    <Title level={3}>{'#' + this.props.detailFinishOrder.ticketCode}</Title>
                                                </Col>
                                                <Col span={24}>
                                                    <Title level={3}>{this.props.detailFinishOrder.ticketTitle}</Title>
                                                </Col>
                                                {(this.props.detailFinishOrder.referenceTicketCode) ?
                                                    <Col span={24}>
                                                        <Text><b>Ref. Ticket ID</b></Text>
                                                    </Col>
                                                    : <></>
                                                }
                                                {(this.props.detailFinishOrder.referenceTicketCode) ?
                                                    <Col span={24}>
                                                        <Title className="body-detail" level={4}>{'#' + this.props.detailFinishOrder.referenceTicketCode}</Title>
                                                    </Col>
                                                    : <></>
                                                }
                                                <Col span={8}>
                                                    <Text><b>Customer</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>Branch</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>History</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.companyName}</Title>
                                                </Col>
                                                <Col span={8}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.branchName}</Title>
                                                </Col>
                                                <Col span={8}>
                                                    <Text className="text-detail" style={{ fontSize: 12 }} onClick={() => this.handleModalHistory('detail', this.props.detailFinishOrder)}>SEE HISTORY</Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>PIC</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>Worker</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>Rating</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.picName}</Title>
                                                </Col>
                                                <Col span={8}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.workerName}</Title>
                                                </Col>
                                                <Col span={8}>
                                                    <Rate disabled value={this.props.detailFinishOrder.dispatchReportRating} />
                                                </Col>
                                                {this.props.detailFinishOrder.value && this.props.detailFinishOrder.value !== "-" ? (
                                                    this.props.detailFinishOrder.value.map(items =>
                                                        <Col span={8}>
                                                            <Text><b>{items.label}</b></Text><br></br>
                                                            <Title className="body-detail" level={4}>{items.data !== 'Other' ? items.data : items.text}</Title>
                                                        </Col>
                                                    )
                                                ) : (
                                                    <p></p>
                                                )
                                                }
                                                {this.props.detailFinishOrder.value && this.props.detailFinishOrder.value !== "-" ? (
                                                    <p></p>
                                                ) : (
                                                    <Col span={8}>
                                                        <Text><b>Failure</b></Text>
                                                    </Col>
                                                )
                                                }
                                                {this.props.detailFinishOrder.value && this.props.detailFinishOrder.value !== "-" ? (
                                                    <p></p>
                                                ) : (
                                                    <Col span={8}>
                                                        <Text><b>Diagnose</b></Text>
                                                    </Col>
                                                )
                                                }
                                                {this.props.detailFinishOrder.value && this.props.detailFinishOrder.value !== "-" ? (
                                                    <p></p>
                                                ) : (
                                                    <Col span={8}>
                                                        <Text><b>Action</b></Text>
                                                    </Col>
                                                )
                                                }
                                                {this.props.detailFinishOrder.value && this.props.detailFinishOrder.value !== "-" ?
                                                    <p></p>
                                                    :
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailFinishOrder.dispatchReportFailure}</Title>
                                                    </Col>
                                                }
                                                {this.props.detailFinishOrder.value && this.props.detailFinishOrder.value !== "-" ?
                                                    <p></p>
                                                    :
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailFinishOrder.dispatchReportDiagnostic}</Title>
                                                    </Col>
                                                }
                                                {this.props.detailFinishOrder.value && this.props.detailFinishOrder.value !== "-" ?
                                                    <p></p>
                                                    :
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailFinishOrder.dispatchReportAction} </Title>
                                                    </Col>
                                                }
                                                <Col span={24}>
                                                    <Text><b>Notes</b></Text>
                                                </Col>
                                                <Col span={24}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.dispatchReportNote}</Title>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>Date Start</b></Text>
                                                </Col>
                                                <Col span={4}>
                                                    <Text><b>Time</b></Text>
                                                </Col>
                                                <Col span={7}>
                                                    <Text><b>Date End</b></Text>
                                                </Col>
                                                <Col span={5}>
                                                    <Text><b>Time</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.startJob ? moment(this.props.detailFinishOrder.startJob).format('LL') : ''}</Title>
                                                </Col>
                                                <Col span={4}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.startJob ? moment(this.props.detailFinishOrder.startJob).format('HH:mm') : ''}</Title>
                                                </Col>
                                                <Col span={7}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.endJob ? moment(this.props.detailFinishOrder.endJob).format('LL') : ''}</Title>
                                                </Col>
                                                <Col span={5}>
                                                    <Title className="body-detail" level={4}>{this.props.detailFinishOrder.endJob ? moment(this.props.detailFinishOrder.endJob).format('HH:mm') : ''}</Title>
                                                </Col>
                                                <Col span={24}>
                                                    <Text><b>Description</b></Text>
                                                </Col>
                                                <Col span={24}>
                                                    <TextArea style={{ marginBottom: '0.5rem' }} rows={4} readOnly={true} className="input-modal" value={this.props.detailFinishOrder.description}></TextArea>
                                                </Col>
                                                <Col span={12}>
                                                    <Text><b>Signature Image</b></Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Text><b>Reported Image</b></Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Carousel>
                                                        {this.props.detailFinishOrder.signatureReport && this.props.detailFinishOrder.signatureReport !== "-" ? (
                                                            <div className="report-image-signature">
                                                                <img alt="Signature" style={{ objectFit: "contain", width: '100%', height: '100%' }} src={this.props.detailFinishOrder.signatureReport}></img>
                                                            </div>
                                                        ) : (
                                                            <div className="report-image">
                                                                <h3 style={{ color: '#fff' }}>Image-1</h3>
                                                            </div>
                                                        )}
                                                    </Carousel>
                                                </Col>
                                                <Col span={12}>
                                                    <Carousel autoplay>
                                                        {this.props.detailFinishOrder.listImageReport && this.props.detailFinishOrder.listImageReport !== "-" ? (
                                                            this.props.detailFinishOrder.listImageReport.map((items, index) =>
                                                                <div key={`cardImage${index}`} className="report-image-card">
                                                                    <img alt="Report" style={{ objectFit: "contain", width: '100%', height: '100%' }} src={items.imageUrl}></img>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="report-image">
                                                                <h3 style={{ color: '#fff' }}>Image-1</h3>
                                                            </div>
                                                        )}
                                                    </Carousel>
                                                </Col>
                                                <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15 }}>
                                                    <Space size={'small'}>
                                                        {/* (this.props.accessRight.includes('Confirm Reported') && this.props.detailFinishOrder.dispatchReportRating > 0 && this.props.detailFinishOrder.status == 'Reported') ?
                                              <Popconfirm
                                                title="Are you sure?"
                                                okText="Yes"
                                                cancelText="No"
                                                onConfirm={ () => this.handleConfirm(this.props.detailFinishOrder) }
                                              >
                                                <Button
                                                      type="primary"
                                                      style={{
                                                          paddingLeft: '20px',
                                                          paddingRight: '20px',
                                                          borderRadius: '5px'
                                                      }}
                                                      loading={this.props.loadingConfirm[this.props.detailFinishOrder.orderId]}
                                                >
                                                    Confirm
                                                </Button>
                                              </Popconfirm>
                                              :<></>
                                            */}
                                                        <Button
                                                            style={{
                                                                paddingLeft: '20px',
                                                                paddingRight: '20px',
                                                                borderRadius: '5px'
                                                            }}
                                                            onClick={() => this.handleModalNote('Open', this.props.detailFinishOrder.ticketId)}
                                                        >
                                                            Note
                                            </Button>
                                                        <Button
                                                            type="danger"
                                                            style={{
                                                                paddingLeft: '20px',
                                                                paddingRight: '20px',
                                                                borderRadius: '5px'
                                                            }}
                                                            onClick={this.props.buttonCancel}
                                                        >
                                                            Close
                                            </Button>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Spin>
                            </Modal>
                            : this.props.title === "Detail Confirm Reported Order" ?
                                <Modal
                                    visible={this.props.visible}
                                    className="form-modal"
                                    footer={null}
                                    closable={false}
                                    centered
                                    width={900}
                                >
                                    <Spin spinning={this.props.loading} tip={'Loading'}>
                                        <Row gutter={20}>
                                            <Col span={24}>
                                                <Row gutter={15}>
                                                    <Col span={24}>
                                                        <Title level={3}>{'#' + this.props.detailConfirmReportedOrder.ticketCode}</Title>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Title level={3}>{this.props.detailConfirmReportedOrder.ticketTitle}</Title>
                                                    </Col>

                                                    {(this.props.detailConfirmReportedOrder.referenceTicketCode) ?
                                                        <Col span={24}>
                                                            <Text><b>Ref. Ticket ID</b></Text>
                                                        </Col>
                                                        : <></>
                                                    }
                                                    {(this.props.detailConfirmReportedOrder.referenceTicketCode) ?
                                                        <Col span={24}>
                                                            <Title className="body-detail" level={4}>{'#' + this.props.detailConfirmReportedOrder.referenceTicketCode}</Title>
                                                        </Col>
                                                        : <></>
                                                    }
                                                    <Col span={8}>
                                                        <Text><b>Customer</b></Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Text><b>Branch</b></Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Text><b>History</b></Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.companyName}</Title>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.branchName}</Title>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Text className="text-detail" style={{ fontSize: 12 }} onClick={() => this.handleModalHistory('detail', this.props.detailConfirmReportedOrder)}>SEE HISTORY</Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Text><b>PIC</b></Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Text><b>Worker</b></Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Text><b>Rating</b></Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.picName}</Title>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.workerName}</Title>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Rate disabled value={this.props.detailConfirmReportedOrder.dispatchReportRating} />
                                                    </Col>
                                                    {this.props.detailConfirmReportedOrder.value && this.props.detailConfirmReportedOrder.value !== "-" ? (
                                                        this.props.detailConfirmReportedOrder.value.map(items =>
                                                            <Col span={8}>
                                                                <Text><b>{items.label}</b></Text><br></br>
                                                                <Title className="body-detail" level={4}>{items.data !== 'Other' ? items.data : items.text}</Title>
                                                            </Col>
                                                        )
                                                    ) : (
                                                        <p></p>
                                                    )
                                                    }
                                                    {this.props.detailConfirmReportedOrder.value && this.props.detailConfirmReportedOrder.value !== "-" ? (
                                                        <p></p>
                                                    ) : (
                                                        <Col span={8}>
                                                            <Text><b>Failure</b></Text>
                                                        </Col>
                                                    )
                                                    }
                                                    {this.props.detailConfirmReportedOrder.value && this.props.detailConfirmReportedOrder.value !== "-" ? (
                                                        <p></p>
                                                    ) : (
                                                        <Col span={8}>
                                                            <Text><b>Diagnose</b></Text>
                                                        </Col>
                                                    )
                                                    }
                                                    {this.props.detailConfirmReportedOrder.value && this.props.detailConfirmReportedOrder.value !== "-" ? (
                                                        <p></p>
                                                    ) : (
                                                        <Col span={8}>
                                                            <Text><b>Action</b></Text>
                                                        </Col>
                                                    )
                                                    }
                                                    {this.props.detailConfirmReportedOrder.value && this.props.detailConfirmReportedOrder.value !== "-" ?
                                                        <p></p>
                                                        :
                                                        <Col span={8}>
                                                            <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.dispatchReportFailure}</Title>
                                                        </Col>
                                                    }
                                                    {this.props.detailConfirmReportedOrder.value && this.props.detailConfirmReportedOrder.value !== "-" ?
                                                        <p></p>
                                                        :
                                                        <Col span={8}>
                                                            <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.dispatchReportDiagnostic}</Title>
                                                        </Col>
                                                    }
                                                    {this.props.detailConfirmReportedOrder.value && this.props.detailConfirmReportedOrder.value !== "-" ?
                                                        <p></p>
                                                        :
                                                        <Col span={8}>
                                                            <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.dispatchReportAction} </Title>
                                                        </Col>
                                                    }
                                                    <Col span={24}>
                                                        <Text><b>Notes</b></Text>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.dispatchReportNote}</Title>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Text><b>Date Start</b></Text>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Text><b>Time</b></Text>
                                                    </Col>
                                                    <Col span={7}>
                                                        <Text><b>Date End</b></Text>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Text><b>Time</b></Text>
                                                    </Col>
                                                    <Col span={8}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.startJob ? moment(this.props.detailConfirmReportedOrder.startJob).format('LL') : ''}</Title>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.startJob ? moment(this.props.detailConfirmReportedOrder.startJob).format('HH:mm') : ''}</Title>
                                                    </Col>
                                                    <Col span={7}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.endJob ? moment(this.props.detailConfirmReportedOrder.endJob).format('LL') : ''}</Title>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Title className="body-detail" level={4}>{this.props.detailConfirmReportedOrder.endJob ? moment(this.props.detailConfirmReportedOrder.endJob).format('HH:mm') : ''}</Title>
                                                    </Col>
                                                    <Col span={24}>
                                                        <Text><b>Description</b></Text>
                                                    </Col>
                                                    <Col span={24}>
                                                        <TextArea style={{ marginBottom: '0.5rem' }} rows={4} readOnly={true} className="input-modal" value={this.props.detailConfirmReportedOrder.description}></TextArea>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Text><b>Signature Image</b></Text>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Text><b>Reported Image</b></Text>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Carousel>
                                                            {this.props.detailConfirmReportedOrder.signatureReport && this.props.detailConfirmReportedOrder.signatureReport !== "-" ? (
                                                                <div className="report-image-signature">
                                                                    <img alt="Signature" style={{ objectFit: "contain", width: '100%', height: '100%' }} src={this.props.detailConfirmReportedOrder.signatureReport}></img>
                                                                </div>
                                                            ) : (
                                                                <div className="report-image">
                                                                    <h3 style={{ color: '#fff' }}>Image-1</h3>
                                                                </div>
                                                            )}
                                                        </Carousel>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Carousel autoplay>
                                                            {this.props.detailConfirmReportedOrder.listImageReport && this.props.detailConfirmReportedOrder.listImageReport !== "-" ? (
                                                                this.props.detailConfirmReportedOrder.listImageReport.map((items, index) =>
                                                                    <div key={`cardImage${index}`} className="report-image-card">
                                                                        <img alt="Report" style={{ objectFit: "contain", width: '100%', height: '100%' }} src={items.imageUrl}></img>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div className="report-image">
                                                                    <h3 style={{ color: '#fff' }}>Image-1</h3>
                                                                </div>
                                                            )}
                                                        </Carousel>
                                                    </Col>
                                                    <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15 }}>
                                                        <Space size={'small'}>
                                                            <Button
                                                                style={{
                                                                    paddingLeft: '20px',
                                                                    paddingRight: '20px',
                                                                    borderRadius: '5px'
                                                                }}
                                                                onClick={() => this.handleModalNote('Open', this.props.detailConfirmReportedOrder.ticketId)}
                                                            >
                                                                Note
                                            </Button>
                                                            <Button
                                                                type="danger"
                                                                style={{
                                                                    paddingLeft: '20px',
                                                                    paddingRight: '20px',
                                                                    borderRadius: '5px'
                                                                }}
                                                                onClick={this.props.buttonCancel}
                                                            >
                                                                Close
                                            </Button>
                                                        </Space>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Spin>
                                </Modal>
                                : this.props.title === "On-Hold Reason" ?
                                    <Modal
                                        visible={this.props.visible}
                                        className="form-modal"
                                        footer={null}
                                        closable={false}
                                        centered
                                        width={450}>
                                        <Spin spinning={this.props.loading} tip={'Loading'}>
                                            <Row gutter={15}>
                                                <Col span={24}>
                                                    <Title style={{ fontSize: '20px' }}><b>{this.props.title + ' #' + this.props.detailTicketHold.ticketCode}</b></Title>
                                                </Col>
                                                <Col span={24}>
                                                    <Text level={3}>{this.props.detailTicketHold.reason}</Text>
                                                </Col>
                                                <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15 }}>
                                                    <Space size={'small'}>
                                                        <Button
                                                            type="danger"
                                                            style={{
                                                                paddingLeft: '20px',
                                                                paddingRight: '20px',
                                                                borderRadius: '5px'
                                                            }}
                                                            onClick={this.props.buttonCancel}
                                                        >
                                                            Close
                                    </Button>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Spin>
                                    </Modal>
                                    :
                                    <Modal
                                        visible={this.props.visible}
                                        className="form-modal"
                                        footer={null}
                                        closable={false}
                                        centered
                                        width={600}
                                    >
                                        <Spin spinning={this.props.loading} tip={'Loading'}>
                                            <Row gutter={15}>
                                                <Col span={24}>
                                                    <Title level={3}>{'#' + this.props.detailTicketCancel.ticketCode}</Title>
                                                </Col>
                                                <Col span={24}>
                                                    <Title level={3}>{this.props.detailTicketCancel.ticketTitle}</Title>
                                                </Col>
                                                {(this.props.detailTicketCancel.referenceTicketCode) ?
                                                    <Col span={24}>
                                                        <Text><b>Ref. Ticket ID</b></Text>
                                                    </Col>
                                                    : <></>
                                                }
                                                {(this.props.detailTicketCancel.referenceTicketCode) ?
                                                    <Col span={24}>
                                                        <Title className="body-detail" level={4}>{"#" + this.props.detailTicketCancel.referenceTicketCode}</Title>
                                                    </Col>
                                                    : <></>
                                                }
                                                <Col span={12}>
                                                    <Text><b>Customer</b></Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Text><b>Branch</b></Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Title className="body-detail" level={4}>{this.props.detailTicketCancel.branchName}</Title>
                                                </Col>
                                                <Col span={12}>
                                                    <Title className="body-detail" level={4}>{this.props.detailTicketCancel.companyName}</Title>
                                                </Col>
                                                <Col span={12}>
                                                    <Text><b>PIC</b></Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Text><b>History</b></Text>
                                                </Col>
                                                <Col span={12}>
                                                    <Title className="body-detail" level={4}>{this.props.detailTicketCancel.picName}</Title>
                                                </Col>
                                                <Col span={12}>
                                                    <Text className="text-detail" style={{ fontSize: 12 }} onClick={() => this.handleModalHistory('detail', this.props.detailTicketCancel)}>SEE HISTORY</Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>Date Start</b></Text>
                                                </Col>
                                                <Col span={4}>
                                                    <Text><b>Time</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Text><b>Date Canceled</b></Text>
                                                </Col>
                                                <Col span={4}>
                                                    <Text><b>Time</b></Text>
                                                </Col>
                                                <Col span={8}>
                                                    <Title className="body-detail" level={4}>{this.props.detailTicketCancel.startJob ? moment(this.props.detailTicketCancel.startJob).format('LL') : ''}</Title>
                                                </Col>
                                                <Col span={4}>
                                                    <Title className="body-detail" level={4}>{this.props.detailTicketCancel.startJob ? moment(this.props.detailTicketCancel.startJob).format('HH:mm') : ''}</Title>
                                                </Col>
                                                <Col span={8}>
                                                    <Title className="body-detail" level={4}>{this.props.detailTicketCancel.canceledJob ? moment(this.props.detailTicketCancel.canceledJob).format('LL') : ''}</Title>
                                                </Col>
                                                <Col span={4}>
                                                    <Title className="body-detail" level={4}>{this.props.detailTicketCancel.canceledJob ? moment(this.props.detailTicketCancel.canceledJob).format('HH:mm') : ''}</Title>
                                                </Col>
                                                <Col span={24}>
                                                    <Text><b>Reason</b></Text>
                                                </Col>
                                                <Col span={24}>
                                                    <TextArea rows={4} readOnly={true} className="input-modal" value={this.props.detailTicketCancel.reason}></TextArea>
                                                </Col>
                                                <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15 }}>
                                                    <Space size={'small'}>
                                                        {(this.props.accessRight.includes('Re-Opens')) ?
                                                            <Popconfirm
                                                                title="Are you sure?"
                                                                okText="Yes"
                                                                cancelText="No"
                                                                onConfirm={() => this.handleReopen(this.props.detailTicketCancel)}
                                                            >
                                                                <Button
                                                                    type="primary"
                                                                    style={{
                                                                        paddingLeft: '20px',
                                                                        paddingRight: '20px',
                                                                        borderRadius: '5px',
                                                                        backgroundColor: 'green',
                                                                        borderColor: 'green'
                                                                    }}
                                                                    loading={this.props.loadingReopen[this.props.detailTicketCancel.orderId]}
                                                                >
                                                                    Re-Open
                                    </Button>
                                                            </Popconfirm>
                                                            : <></>
                                                        }
                                                        <Button
                                                            style={{
                                                                paddingLeft: '20px',
                                                                paddingRight: '20px',
                                                                borderRadius: '5px'
                                                            }}
                                                            onClick={() => this.handleModalNote('Open', this.props.detailTicketCancel.ticketId)}
                                                        >
                                                            Note
                                    </Button>
                                                        <Button
                                                            type="danger"
                                                            style={{
                                                                paddingLeft: '20px',
                                                                paddingRight: '20px',
                                                                borderRadius: '5px'
                                                            }}
                                                            onClick={this.props.buttonCancel}
                                                        >
                                                            Close
                                    </Button>
                                                    </Space>
                                                </Col>
                                            </Row>
                                        </Spin>
                                    </Modal>
                }
                <Modal
                    visible={this.props.visibleAssignDispatch}
                    className="form-modal"
                    footer={null}
                    closable={false}
                    width={580}
                    centered
                >
                    <Spin spinning={this.props.loadingListWorker}>
                        <Row gutter={15}>
                            <Col span={24}>
                                <Title level={3}>Assign Technician</Title>
                            </Col>
                            <Col span={18}>
                                <Checkbox checked={this.props.handleChecked} onChange={(val) => this.props.changeArea(val)} className="checkbox-modal"><b>Secondary Area</b></Checkbox>
                                <Checkbox checked={this.props.handleCheckedTechnician} onChange={(val) => this.props.changeAreaTechnician(val)} className="checkbox-modal"><b>Technician On Dispatch</b></Checkbox>
                            </Col>
                            <Col offset={8} span={16} style={{ paddingTop: '10px' }}>
                                <Row style={{ alignItems: 'center' }}>
                                    <Col span={8}>
                                        <Text><b>Task Period</b></Text>
                                    </Col>
                                    <Col span={16}>
                                        <Select defaultValue={1} className="select-work-day" onChange={this.handleChange.bind(this)}
                                            style={{
                                                border: '1px solid rgba(0, 0, 0, 0.85)',
                                                boxShadow: 'none',
                                                borderRadius: '20px'
                                            }}
                                        >
                                            {
                                                optionListPeriod.map(function (item) {
                                                    return (
                                                        <Option key={item.key} value={item.key}>
                                                            {item.name}
                                                        </Option>
                                                    );
                                                })
                                            }
                                        </Select>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24} style={{ height: 500, maxHeight: 500, overflow: 'hidden auto', marginBottom: 30, marginTop: 20 }}>
                                {
                                    this.props.listWorker ?
                                        this.props.listWorker.map((item, index) => {
                                            return (
                                                <Card key={`cardTeknisi${index}`} className="card" style={{ marginRight: 10, marginBottom: 20 }}>
                                                    <Row gutter={20}>
                                                        <Col span={7}>
                                                            {item.imageUrl && item.imageUrl !== '' ? (
                                                                <Avatar shape="square" size={90} src={item.imageUrl} />
                                                            ) : (
                                                                <Avatar shape="square" size={90} icon={<UserOutlined />} />
                                                            )}
                                                        </Col>
                                                        <Col span={17}>
                                                            <Title level={4} style={{ margin: 0 }}>
                                                                {item.workerName}
                                                            </Title>
                                                            <Text><b>{item.workerAddress}</b></Text><br /><br />
                                                            <Row>
                                                                <Col span={12}>
                                                                    <Popconfirm
                                                                        placement="right"
                                                                        title="Are you sure?"
                                                                        okText="yes"
                                                                        cancelText="no"
                                                                        onConfirm={() => this.props.assign(item.workerId)}>
                                                                        <Button
                                                                            className="button-dispatch" type="primary"
                                                                            size="small"
                                                                            style={{ width: 100 }}
                                                                            loading={this.props.loadingCreateDispatch[item.workerId] || false}
                                                                        >
                                                                            Assign
                                                                    </Button>
                                                                    </Popconfirm>
                                                                </Col>
                                                                <Col span={12}>
                                                                    <Text><b>Total Task : </b></Text>
                                                                    <Text style={{ border: '1px solid', padding: '5px' }} ><b>{item.workerTotalTask} Task</b></Text>
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            )
                                        })
                                        : (<React.Fragment></React.Fragment>)
                                }
                            </Col>
                        </Row>
                    </Spin>
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            type="danger"
                            size={'small'}
                            style={{
                                paddingLeft: '20px',
                                paddingRight: '20px',
                                borderRadius: '5px',
                                textAlign: 'right',
                                marginBottom: '20px'

                            }}
                            onClick={this.props.buttonCancelAssign}
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.visibleHistory}
                    className="form-modal"
                    footer={null}
                    closable={false}
                    centered
                    width={650}
                >
                    <Title level={3}>Dispatching History #{codeHistory} </Title>
                    <Table
                        size="middle"
                        columns={[
                            {
                                title: "Status",
                                dataIndex: "status",
                                key: 'status',
                                render: status => {
                                    if (status.toLowerCase() === "dispatched") {
                                        return (
                                            <Tag color="blue">{status}</Tag>
                                        )
                                    } else if (status.toLowerCase() === "canceled") {
                                        return (
                                            <Tag color="red">{status}</Tag>
                                        )
                                    } else if (status.toLowerCase() === "confirmed") {
                                        return (
                                            <Tag color="green">{status}</Tag>
                                        )
                                    } else if (status.toLowerCase() === "hold") {
                                        return (
                                            <Tag color="orange">{status}</Tag>
                                        )
                                    } else {
                                        return (
                                            <Tag >{status}</Tag>
                                        )
                                    }
                                },
                            },
                            {
                                title: "Action",
                                dataIndex: "action",
                                key: 'action'
                            },
                            {
                                title: "Date",
                                dataIndex: "date",
                                key: 'date'
                            },
                            {
                                title: "Reason",
                                dataIndex: "reason",
                                key: 'reason'
                            },
                        ]}
                        dataSource={this.state.listHistory}
                        loading={this.state.loading}
                    // scroll={{x: 1100}}
                    />
                    <Row gutter={15}>
                        <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15, }}>
                            <Space size={'small'}>
                                <Button
                                    type="danger"
                                    style={{
                                        paddingLeft: '20px',
                                        paddingRight: '20px',
                                        borderRadius: '5px'
                                    }}
                                    onClick={() => this.handleModalHistory('close')}
                                >
                                    Close
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    visible={this.state.visibleNote}
                    className="form-modal"
                    footer={null}
                    closable={false}
                    centered
                    width={450}>
                    <Table
                        size="middle"
                        columns={[
                            {
                                title: "Note",
                                dataIndex: "note",
                                key: 'note'
                            },
                            {
                                title: "Date",
                                dataIndex: "date",
                                key: 'date'
                            },
                        ]}
                        dataSource={this.state.listNote}
                        loading={this.state.loadingNote}
                    // scroll={{x: 1100}}
                    />
                    <Row gutter={15}>
                        <Col span={24} style={{ textAlign: 'right', marginTop: 40, marginBottom: 15, }}>
                            <Space size={'small'}>
                                <Button
                                    type="danger"
                                    style={{
                                        paddingLeft: '20px',
                                        paddingRight: '20px',
                                        borderRadius: '5px'
                                    }}
                                    onClick={() => this.handleModalNote('close', '')}
                                >
                                    Close
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Modal>
            </div >
        )
    }
}

export default ModalCreateEdit;
