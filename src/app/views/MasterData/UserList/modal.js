import React from "react";
import { Modal, Typography, Spin } from "antd";
import '../../../css/global.css';
import FormUser from "./form";

const { Title } = Typography;

class ModalCreateEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                className="form-modal"
                footer={null}
                closable={false}
                centered
                width={600}
            >
                <Spin
                    spinning={
                        this.props.loadingCity &&
                        this.props.laodingRole &&
                        this.props.loadingTenant
                    }
                >
                    <Title level={3}>
                        {this.props.title}
                    </Title>
                    {
                        this.props.visible ?
                        (
                            <FormUser
                                city={this.props.city}
                                userRole={this.props.userRole}
                                listIdentity={this.props.listIdentity}
                                onFinish={values => this.props.onFinish(values)}
                                visible={this.props.visible}
                                buttonCancel={this.props.buttonCancel}
                                data={this.props.data}
                                loading={this.props.loading}
                                mapsVisible={this.props.mapsVisible}
                                mapView={this.props.mapView}
                                currentPos={this.props.currentPos}
                                currentPosUpdate={this.props.currentPosUpdate}
                                handleClickMaps={this.props.handleClickMaps}
                                handleClickOk={this.props.handleClickOk}
                                infoWindowVisible={this.props.infoWindowVisible}
                                onMarkerDragEnd={this.props.onMarkerDragEnd}
                                windowClosed={this.props.windowClosed}
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
