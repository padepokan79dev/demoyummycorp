import React from "react";
import { withRouter, NavLink } from "react-router-dom";
import { Menu, Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Cookies from 'js-cookie'

class HeaderLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menuJson: []
		}
	}

	subMenu(sub){
		return (
			<Menu className="dropdown-menu-custom">
				{ sub.map((submenu, index)=>{
						return (
							<Menu.Item key={index} style={{ color: '#FFF' }}>
								<NavLink to={submenu.navlink} style={{ color: '#FFF' }}>
									{submenu.name}
								</NavLink>
							</Menu.Item>
						)
					})
				}
			</Menu>
		)
	}

	toggleMenu = (e) => {
		const navbarUl = document.querySelector(".navbar");
		navbarUl.classList.toggle("show");
	}

	clickMenu(menu){
		sessionStorage.setItem("accessRight", JSON.stringify(menu.accessRight))
	}

	componentDidMount(){
		var menuJson = JSON.parse(Cookies.get("menu"))

		var resultMenu = [];
		for (var i = 0; i < menuJson.length; i++) {
			if (menuJson[i].accessRight.length > 0){
				for (var j = 0; j < menuJson[i].accessRight.length; j++) {
					if (menuJson[i].accessRight[j] == 'Read'){
						resultMenu.push(menuJson[i])
						break
					}
				}
			} else {
				var dtMenu = menuJson[i]
				var submenu = []
				for (var j = 0; j < dtMenu.submenu.length; j++) {
					for (var k = 0; k < dtMenu.submenu[j].accessRight.length; k++) {
						if (dtMenu.submenu[j].accessRight[k] == 'Read'){
							submenu.push(dtMenu.submenu[j])
							break
						}
					}
				}
				dtMenu.submenu = submenu
				if (submenu.length > 0){
					resultMenu.push(dtMenu)
				}
			}
		}

		this.setState({ menuJson: resultMenu })
	}

	componentDidUpdate(){
		var menuJson = JSON.parse(Cookies.get("menu"))
		var location = (this.props.location.pathname == "/workload-calendar") ? "/workload" : this.props.location.pathname
		var noAccessRight = true

		for (var i = 0; i < menuJson.length; i++) {
			if (menuJson[i].navlink == location) {
				noAccessRight = false
				this.clickMenu(menuJson[i])
				break
			} else {
				for (var j = 0; j < menuJson[i].submenu.length; j++) {
					if (menuJson[i].submenu[j].navlink == location) {
						noAccessRight = false
						this.clickMenu(menuJson[i].submenu[j])
						break
						break
					}
				}
			}
		}

		if (noAccessRight){
			this.clickMenu([])
		}
	}

	render() {
		return (
			<nav className="navbar">
				<div className="wrapper">
						<div onClick={(e) => this.toggleMenu(e)}>
							<MenuOutlined className="icon-burger" />
						</div>
						<ul>
							{ this.state.menuJson.map( (menu, index) => {
									return (
										(menu.submenu.length > 0) ?
											<Dropdown key={index} overlay={this.subMenu(menu.submenu)}>
												<li className="menu-dropdown" style={{width: '134px', textAlign: 'center'}}>{menu.name}</li>
											</Dropdown>
										:

											<NavLink key={index} to={menu.navlink} style={{ color: '#FFF' }}>
												<li style={{ cursor: 'pointer' }}>
													{menu.name}
												</li>
											</NavLink>
									)
								})
							}

							{/* <NavLink to="/report" style={{ color: '#FFF' }}>
								<li>
									Report
								</li>
							</NavLink>*/}
						</ul>
				</div>
			</nav>
		);
	}
}

export default withRouter(HeaderLayout);
