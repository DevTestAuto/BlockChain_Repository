
import React, { Component } from 'react';
import Layout from '../components/Layout';
import { Button, Table, Grid, Form, Image, Loader, Dimmer } from 'semantic-ui-react';
import BCDetailedData from '../components/BCDetailedData';
import ConstantsList from "../constants/address.js";
import empContract from '../ethereum/factory'
import logo from '../images/header-left.png';
import web3 from '../ethereum/web3';
import Footer from '../components/Footer'

require('../styles.css');
var oldIndex = -1;
var olderIndex = -1;
var bcEmpPersonalInfo = [];
var bcEmpProfessionalInfo = [];
var bcRevEmpPersonalInfo = [];
var bcRevEmpProfessionalInfo = [];
/**
 * This component is used to display Blockchain data based on employee id
 */
class BcDataInfo extends Component {

    state = {
        user: '',
        cvalue: '',

    };

    loadingShow = () => this.setState({ active: true })

    loadingHide = () => this.setState({ active: false })

    async componentDidMount() {
        document.body.style.backgroundColor = "#e5e7f4";
        if (this.props.location.state !== 'undefined' && this.props.location.state !== undefined) {
            this.loadingShow();

            if (this.props.location.state.role === ConstantsList.HRUser) {
                this.setState({ user: ConstantsList.HRUser });
            } else if (this.props.location.state.role === ConstantsList.ManagementUser) {
                this.setState({ user: ConstantsList.ManagementUser });
            } else if (this.props.location.state.role === ConstantsList.ManagerUser) {
                this.setState({ user: ConstantsList.ManagerUser });
            }
            const countOfEmployees = await empContract.methods.getCountOfEmployees().call();
            const empProfCount = await empContract.methods.getEmpProfCount().call();
            bcRevEmpPersonalInfo = await Promise.all(
                Array(parseInt(countOfEmployees))
                    .fill()
                    .map((element, index) => {
                        return empContract.methods.personalInfoList(index).call();
                    })
            );
            bcRevEmpProfessionalInfo = await Promise.all(
                Array(parseInt(empProfCount))
                    .fill()
                    .map((element, index) => {
                        return empContract.methods.employmentInfoList(index).call();
                    })
            );
            bcEmpPersonalInfo = [];
            for (var i = (bcRevEmpPersonalInfo.length - 1); i >= 0; i--) {
                bcEmpPersonalInfo.push(bcRevEmpPersonalInfo[i]);
            }
            bcEmpProfessionalInfo = [];
            for (var j = (bcRevEmpProfessionalInfo.length - 1); j >= 0; j--) {
                bcEmpProfessionalInfo.push(bcRevEmpProfessionalInfo[j]);
            }
            this.state.cvalue = this.props.location.state.companyName;
            this.loadingHide();
        }
    }

    /**
     * This method is used to handle back button navigation.
     */
    empInfo = () => {
        this.props.history.push({
            pathname: `/EmpInfo`,
            state: { loginCompany: this.props.location.state.loginCompany, companyName: this.props.location.state.companyName, role: this.props.location.state.role, selectedIndex: 1 }
        })
    }

    /**
     * This method is used to handle logout button navigation
     */
    logout = () => {
        this.props.history.push(`/`);
    }

    /**
     * This method is used to send Blockchain data to BCDetailed data file to render the rows. 
     * @param {*1 or 2} flag 
     */
    renderRows(flag) {
        const { Cell, Row } = Table;
        var perInfo = [];
        var profInfo = [];
        var rempid = -1;
        if (bcEmpPersonalInfo.length > 0 && bcEmpPersonalInfo !== undefined &&
            bcEmpPersonalInfo !== null) {

            bcEmpPersonalInfo.map((employee, index) => {
                if (web3.utils.toAscii(employee.companyId).replace(/\u0000/g, '') === (this.state.cvalue.toString()) &&
                    (web3.utils.toAscii(employee.empId).replace(/\u0000/g, '')) === this.props.location.state.emp_id) {
                    perInfo.push(employee);
                    profInfo.push(bcEmpProfessionalInfo[index]);
                }
            });

          return perInfo.map((employee, index) => {
                rempid = rempid + 1;
                if (index != ((perInfo.length) - 1)) {
                    olderIndex = index + 1;
                } else {
                    olderIndex = index;
                }

                return (
                    <BCDetailedData
                        key={index}
                        id={index}
                        sid={rempid}
                        employee={employee}
                        oldEmployee={perInfo[olderIndex]}
                        oldProfessional={profInfo[olderIndex]}
                        professional={profInfo[index]}
                        status={this.state.isHR}
                        length={(perInfo.length - 1)}
                        user={this.state.user}
                        company={this.state.cvalue}
                        history={this.props.history}
                    />
                );
            });
        } else {
            return (
                <Row>
                    <Cell colSpan="11" textAlign="center">
                        <p style={{ fontSize: '20px', textAlign: 'center', color: 'brown' }}>No records found</p>
                    </Cell>
                </Row>);
        }
    }
    render() {
        if (this.props.location.state !== 'undefined' && this.props.location.state !== undefined) {
            const { active } = this.state
            const { Row, HeaderCell, Body } = Table;

            return (
                <Layout>
                    <div id="header-bg">
                        <Grid>
                            <Grid.Row style={{ marginRight: '-50px', paddingBottom: '0px', paddingTop: '10px' }}>
                                <Grid.Column width={10}>
                                    <Image src={logo} alt="logo" />
                                </Grid.Column>
                                <Grid.Column textAlign='right' width={4} style={{ marginLeft: '25px' }}>
                                    <div style={{ paddingTop: '45px', color: '#6f88c0' }}>Logged In User: <b style={{ color: 'white' }}>{this.state.user}</b></div>
                                </Grid.Column>
                                <Grid.Column style={{ cursor: 'pointer' }} textAlign='right' width={1} onClick={this.logout} >
                                    <div style={{ paddingTop: '45px' }}><b style={{ color: '#92a5cf' }}>Logout</b></div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </div>

                    <Form >

                        <Grid style={{ marginTop: '18px', marginRight: '8px', marginLeft: '8px' }}>
                            <Grid.Row>
                                <Grid.Column width={15} style={{ marginTop: '-9px', marginLeft: '-2px' }}>
                                    <div style={{ borderTop: '1px solid #c8cad6', borderLeft: '1px solid #c8cad6', borderRight: '1px solid #c8cad6', marginTop: '31px', backgroundColor: '#dadce9', width: '340px', padding: '7px', textAlign: 'center' }}>Blockchain Published Data of <span><b>Employee Id - {this.props.location.state.emp_id}</b></span></div>
                                </Grid.Column>

                                <Grid.Column textAlign='right' width={1} style={{ marginTop: '7px', marginLeft: '-28px' }}>
                                    <Button onClick={this.empInfo} style={{ backgroundColor: '#184fa2', color: '#bed4e1' }}>BACK</Button>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>

                    </Form>
                    <Dimmer active={active} inverted >
                        <Loader content='Loading..' />
                    </Dimmer>

                    <div id='container' style={{ height: 'auto', overflow: 'auto', marginLeft: '20px', marginRight: '20px', marginBottom: '25px' }}>
                        <Table celled striped style={{ width: '2000px' }}>
                            <Table.Header>
                                <Row textAlign="center">
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>S.No</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>UEN</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Employee Name</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Father Name</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Gender</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>DOB</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Qualification</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Aadhar Number</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Date Of Joining</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Relieving Date</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Employment Type</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Exit Type</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Designation</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Technical Expertise</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Prev. Employment Verified?</HeaderCell>
                                    <HeaderCell style={{ textAlign: 'center', fontSize: '12px' }} singleLine>Published Date&Time</HeaderCell>
                                </Row>
                            </Table.Header>
                            <Body>{this.renderRows(2)}</Body>
                        </Table>
                    </div>

                    <Footer />
                </Layout>
            );
        } else {
            return (
                <Layout>
                    <div id="header-bg">
                        <Grid>
                            <Grid.Row style={{ marginRight: '5px', paddingBottom: '0px', paddingTop: '10px' }}>
                                <Grid.Column width={9}>
                                    <Image src={logo} alt="logo" />
                                </Grid.Column>

                            </Grid.Row>
                        </Grid>
                    </div>

                    <div style={{ padding: '100px' }}>
                        <h3>Please login to get the Employment Information : <b style={{ cursor: 'pointer', color: '#184ea2' }} onClick={this.logout}><u>Login</u></b></h3>
                    </div>
                </Layout>
            );
        }
    }
}

export default BcDataInfo;