import React from "react";
import { Modal, Typography, Spin } from "antd";
import '../../../css/global.css';
import FormWorker from "./Form";

const { Title } = Typography;

class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            optionListCity: []
        }
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                className="form-modal"
                footer={null}
                closable={(this.props.title).includes("Detail") ? true : false}
                onCancel={this.props.buttonCancel}
                centered
                width={600}
            >
                <Spin
                    spinning={
                        this.props.loadingCity &&
                        this.props.loadingWorkerGroup &&
                        this.props.loadingUserIdentity &&
                        this.props.loadingTenant
                    }
                >
                    <Title level={3}>
                        {this.props.title}
                    </Title>
                    {
                        this.props.visible ?
                        (
                            <FormWorker
                                readOnly={(this.props.title).includes("Detail") ? true : false}
                                city={this.props.city}
                                userIdentity={this.props.userIdentity}
                                jobList={this.props.jobList}
                                searchSkill={this.props.searchSkill}
                                onFinish={values => this.props.onFinish(values)}
                                visible={this.props.visible}
                                buttonCancel={this.props.buttonCancel}
                                data={this.props.data}
                                loading={this.props.loading}
                                mapsVisible={this.props.mapsVisible}
                                mapView={this.props.mapView}
                                currentPos={this.props.currentPos}
                                currentPosUpdate={this.props.currentPosUpdate}
                                handleClickOk={this.props.handleClickOk}
                                onMarkerDragEnd={this.props.onMarkerDragEnd}
                                onPlacesChanged={this.props.onPlacesChanged}
                                onClickMap={this.props.onClickMap}
                                mapCenter={this.props.mapCenter}
                                onCancelMaps={this.props.onCancelMaps}
                                tempCurrentPos={this.props.tempCurrentPos}
                                searchCity={this.props.searchCity}
                                tenantList={this.props.tenantList}
                                searchTenant={this.props.searchTenant}
                            />
                        ) :
                        (
                            <></>
                        )
                    }
                </Spin>
            </Modal>
        )
    }
}

export default ModalCreateEdit;
