<%
/*
 * Copyright (c) 2015-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
%>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>CAVD DataSpace</title>
    <link rel="stylesheet" href="<%=getWebappURL("/frontpage/css/application.css")%>">
    <link rel="stylesheet" href="<%=getWebappURL("/frontpage/components/fullpage.js/jquery.fullPage.css")%>">
    <link rel="stylesheet" href="<%=getWebappURL("/frontpage/components/magnific-popup/dist/magnific-popup.css")%>">
    <style type="text/css">
        /* Context-sensitive url */
        .section.intro-section .video-container .video-placeholder {
            background-image: url(<%=getWebappURL("/frontpage/img/intro.jpg")%>);
        }

        .twitter {
            width: 3em !important;
            margin: 0 !important;
        }

        .twitter-logo {
            background-image: url(<%=getWebappURL("/frontpage/img/Twitter.svg")%>);
            height: 24px;
            width: 24px !important;
            display: inline !important;
            padding-right: 20px !important;
            background-repeat: no-repeat;
        }
    </style>

    <link rel="icon" type="image/png" href="<%=getWebappURL("/frontpage/img/headerlogo.png")%>">

    <!-- Include base labkey.js -->
    <%=PageFlowUtil.getLabkeyJS(getViewContext(), null, null, false)%>
    <script data-main="<%=getWebappURL("/frontpage/js/config")%>" src="<%=getWebappURL("/frontpage/components/requirejs/require.js")%>"></script>

    <%--<!-- Client API Dependencies -->--%>
    <%=getScriptTag("/clientapi/core/Utils.js")%>
    <%=getScriptTag("/clientapi/core/ActionURL.js")%>
    <%=getScriptTag("/clientapi/core/Ajax.js")%>
    <%=getScriptTag("/frontpage/components/jquery/dist/jquery.min.js")%>
    <script type="text/javascript">
        reloadRegisterPage = function() {
            window.location = LABKEY.ActionURL.buildURL('cds', 'app', LABKEY.container.path, {register: "TRUE"});
        };

        $(document).ready(function() {
            // notification close button
            $('div.dismiss').click(function(){
                $('#notification').remove();
            });
        });
    </script>
</head>
<body>
    <div id="navigation">
        <div class="icon" data-js-id="frontPageHomeIcon">
            <div class="img">
                <img src="<%=getWebappURL("/frontpage/img/icon.png")%>">
            </div>
        </div>
        <div class="title" data-js-id="frontPageNavTitle">
            <strong>CAVD</strong>
            <p>DataSpace</p>
        </div>
        <div class="links">
            <div class="link hide sign-in">
                <span>CAVD DataSpace Members:</span>
                <a href="#" class="create-account-modal-trigger">Create Account</a>
                <a href="#" class="signin-modal-trigger front-page-button">Sign In</a>
            </div>
        </div>
    </div>
    <div id="notification">
        <div class="warning">
            <img src="<%=getWebappURL("/frontpage/img/warning_indicator.svg")%>" width="20" height="20"/>
        </div>
        <div class="notification-messages">
        </div>
        <div class="dismiss">
            <img src="<%=getWebappURL("/frontpage/img/dismiss.svg")%>" width="20" height="20"/>
        </div>
    </div>
    <div class="signin-modal-popup hidden">
        <div class="signin-modal front-page-popup-container">
            <div data-form="sign-in" class="sign-in">
                <div class="border"></div>
                <div class="title">
                    <h1>CAVD DataSpace member sign-in</h1>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form class="form" id="signinform" method="post">
                    <div class="credentials">
                        <!-- fake fields are a workaround for chrome autofill getting the wrong fields. They will be removed if Remember Me is checked. -->
                        <input style="display:none" type="text" id="fakeusernameremembered"/>
                        <input style="display:none" type="password" id="fakepasswordremembered"/>

                        <input placeholder="Email" type="email" id="email" name="email" value="" required>
                        <input placeholder="Password" name="password" id="password" type="password" value="" required>
                        <div class="checkbox">
                            <input type="checkbox" id="remember-me-checkbox">
                            <label for="remember-me-checkbox">Remember my email</label>
                        </div>
                    </div>
                    <div class="tos">
                        <div class="checkbox">
                            <input type="checkbox" id="tos-checkbox" required>
                            <label for="tos-checkbox">I will protect restricted data, credit others, and obtain approval to publish.</label>
                        </div>
                        <a href="#" data-click="terms-of-service" class="expand-tos">
                            <strong>I have read, understood, and agreed to the</strong>
                            <strong class="highlight">terms of use.</strong>
                        </a>
                        <div data-action="terms-of-service" class="terms-of-service">
                            <h1>Full Terms of Use agreement</h1>
                            <p>To access and view data in this site you must agree to the Terms of Use for CAVD DataSpace below. Please read these terms carefully. By accessing this site you agree to be bound by these terms. These terms are subject to change. Any changes will be incorporated into the terms posted to this site from time to time. If you do not agree with these terms, please do not access the site. If you are not an authorized user of this site you are hereby notified that any access or use of the information herein is strictly prohibited.</p>
                            <h3>General Information</h3>
                            <p>The CAVD DataSpace ("Site") is made available to members and guests of the Collaboration for AIDS Vaccine Discovery (CAVD) by the Statistical Center for HIV/AIDS Research & Prevention ("SCHARP") at the Fred Hutchinson Cancer Research Center ("FHCRC"). The CAVD DataSpace is supported by SCHARP's Vaccine Immunology Statistical Center (VISC) award funded by the Bill & Melinda Gates Foundation. The purpose of the DataSpace is to help accelerate shared progress in the search for an effective HIV vaccine by making the research community more aware of work being done and enabling exploration beyond primary publications.</p>
                            <h3>Limitations on the Use of the Site</h3>
                            <p>You agree to comply with all terms and conditions defined in the <a href="https://www.cavd.org/about/Pages/LegalAgreements.aspx" target="_blank">CAVD Data and Material Sharing Agreement (DMSA)</a>, including the CAVD DMSA Clinical Trials Addendum, Data & Materials Sharing Principles, Master CAVD Confidential Disclosure Agreement, and Master CAVD Material Transfer Agreement.<br/><br/>You agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else's rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component.</p>
                            <h3>Limitations on the Use of Data and Information from the Site</h3>
                            <p>Without the prior written consent of FHCRC, you:</p>
                            <ul>
                                <li>
                                    <p>(i) will not transfer any information or data from the Site to any unauthorized individual or institution;</p>
                                </li>
                                <li>
                                    <p>(ii) will acknowledge the CAVD DataSpace in all written or verbal publications or presentations involving any data or information obtained from the Site or the results of any use of such data and information; or</p>
                                </li>
                                <li>
                                    <p>(iii) will not file for intellectual property protection for any invention made as a result from or from your use of the data from the Site.</p>
                                </li>
                            </ul>
                            <p>No individual identifiers of vaccine trial subjects will be provided to you through the Site. You agree not to use any information or data from the Site, either alone or in conjunction with any other information to establish the individual identities of any of the vaccine trial subjects from whom the data on the Site was obtained.</p>
                            <h3>Modifications to the Site and Terms of Use</h3>
                            <p>FHCRC may at any time modify, replace, refuse access to, suspend or discontinue the Site, partially or entirely, or change and modify all or part of the services for you or for all users in its sole discretion and without notice.<br/><br/>FHCRC reserves the right to modify the Terms of Use at any time without notice, but the most current version of the Terms of Use will always be available to you by clicking on the link at the bottom of the Site. If you find the Terms of Use unacceptable at any time, you may discontinue your use of the Site, but the Terms of Use shall survive such discontinuation with respect to activity occurring prior to such discontinuation. By continuing to use the Site after the date of any change of the Terms of Use, including accessing the Site, you agree to be bound by the provisions contained in the most recent version of the Terms of Use.</p>
                            <h3>Disclaimers</h3>
                            <p>THE SITE AND ALL INFORMATION AND DATA FROM THE SITE ARE PROVIDED "AS IS" AND "AS AVAILABLE". FHCRC DOES NOT WARRANT THE ACCURACY, ADEQUACY OR COMPLETENESS OF THIS INFORMATION AND DATA, AND, TO THE EXTENT PERMITTED BY LAW, FHCRC EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, IMPLIED, EXPRESSED OR STATUTORY INCLUDING THE WARRANTIES OF NON-INFRINGEMENT OF THIRD PARTY RIGHTS, TITLE, MERCHANTABILITY OR QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF INFORMATION, INFORMATION ACCESS, FREEDOM FROM COMPUTER VIRUS OR OTHER HARMFUL ELEMENTS. THE DISCLAIMERS AND EXCLUSIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES.</p>
                            <h3>Limited Liability and Remedy</h3>
                            <p>YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE IS AT YOUR OWN RISK. FHCRC WILL NOT BE LIABLE FOR ANY DAMAGES RELATED TO YOUR USE OF OR INABILITY TO USE THE SITE, INCLUDING WITHOUT LIMITATION, DIRECT, INDIRECT, SPECIAL, COMPENSATORY OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOSS OF OR DAMAGE TO PROPERTY, EVEN IF FHCRC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE LIMITATIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES AND YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE NO REMEDY AGAINST SUCH SUPPLIERS OR SUBCONTRACTORS FOR ANY COSTS OR DAMAGES YOU INCUR ARISING OUT OF, OR RELATING TO YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE.</p>
                            <h3>Indemnity</h3>
                            <p>You agree to indemnify, defend and hold FHCRC and its officers, directors, owners, agents, employees, affiliates, licensees, licensors suppliers and subcontractors harmless from and against all claims, losses, liability, cost, and expenses (including attorneys' fees) arising from your violation of these Terms of Use or misuse of this Site, or any service, product, information or data provided through this Site. Your obligations under this Section will survive your termination of access to or use of this Site, or nonuse of any service, information or data.</p>
                            <h3>Applicable Law</h3>
                            <p>These Terms of Use will be construed according to Washington State law, without regard to provisions governing conflicts of laws. Any dispute arising under or relating to these Terms of Use, the content, the use of the Site, or any services obtained using this Site, will be resolved exclusively by the state and federal courts of the State of Washington. Your use of the Site constitutes your consent to the jurisdiction and venue of such courts with respect to any such dispute.</p>
                        </div>
                        <span class="agree"></span>
                    </div>
                    <div class="links">
                        <a href="#" data-click="help" class="help">Sign-in Help</a>
                        <input type="button" value="Submit" data-click="confirm" class="confirm" id="signin">
                        <input id="submit_hidden" type="submit" style="display: none">
                    </div>
                </form>
            </div>
            <div data-form="sign-in-help" class="sign-in-help hidden">
                <div class="border"></div>
                <div class="title">
                    <h1>Sign-in Help</h1>
                    <span class="help-info">The DataSpace is open to members with a registered account.<br>To set or reset your password, type in your email address and click the submit button.</span>
                    <br><span class="help-info">Don't have an account? Click <a class="register-links" onclick="return reloadRegisterPage();">here</a> to register</span>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form action="" method="post" class="form">
                    <div class="form">
                        <div class="credentials">
                            <input placeholder="Email" type="email" id="emailhelp" required>
                            <span class="help-info" style="display: block">Members who are still experiencing sign-in trouble should email
                                <a href="mailto:dataspace.support@scharp.org?Subject=CAVD%20DataSpace%20request%20for%20information" class="contact">dataspace.support@scharp.org</a>.
                                <br>Note: Your DataSpace password is not necessarily the same as your Atlas and CAVD Portal passwords.
                            </span>
                        </div>
                    </div>
                    <div class="links">
                        <a href="#" data-click="help" class="help">Cancel</a>
                        <a href="#" data-click="confirmhelp" class="confirm" id="signinhelpsubmit">Submit</a>
                        <input id="submit_hidden_help" type="submit" style="display: none;">
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="register-modal-popup hidden">
        <div class="register-account-modal front-page-popup-container">
            <div class="modal" data-form="register" >
                <div class="border"></div>
                <div class="title" style="margin-bottom: 1em;">
                    <h1>Register for DataSpace</h1>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form action="" method="post" class="form" id="registeraccountform">
                    <div class="credentials">
                        <p class="section-header">Network members</p>
                        <span class="help-info" style="display: block">
                            If you are a CAVD member or a member of an invited network or research organization, you may be pre-registered with a DataSpace account which grants you access to data and information not yet available to public members. Go to
                            <a href="#" data-click="help-register" class="help-register register-links">Sign-in Help</a> to set or reset your password.
                        </span>
                        <br>
                        <p class="section-header">Not a network member?</p>
                        <input placeholder="Email" type="email" id="emailRegister" required>
                        <input placeholder="Verify Email" type="email" id="emailRegisterConfirm" required>
                        <span class="help-info" style="display: block;">
                            To help protect against abuse by bots, please enter the six characters shown below (case insensitive).
                        </span>
                        <div class="kaptcha" onclick="return reloadRegisterPage();">
                            <img src="<%=getWebappURL("/kaptcha.jpg")%>" alt="Verification text" title="Click to get a new image." height="50" width="200"/>
                            <br><a class="register-links">Click to get a different image</a>
                        </div>
                        <input id="kaptchaText" name="kaptchaText" type="text" placeholder="Verification code" required>

                    </div>
                    <div class="links">
                        <a href="#" data-click="dismiss" class="dismiss">Cancel</a>
                        <a href="#" data-click="register" class="confirm" id="registeraccountsubmit">Register</a>
                        <input id="submit_hidden_register" type="submit" style="display: none">
                    </div>
                </form>
            </div>
            <div data-form="register-help" class="sign-in-help hidden">
                <div class="border"></div>
                <div class="title">
                    <h1>Sign-in Help</h1>
                    <span class="help-info">The DataSpace is open to members with a registered account.<br>To set or reset your password, type in your email address and click the submit button.</span>
                    <br><span class="help-info">Don't have an account? Click <a class="register-links" data-click="help-register">here</a> to register</span>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form action="" method="post" class="form">
                    <div class="form">
                        <div class="credentials">
                            <input placeholder="Email" type="email" id="emailhelpregister" required>
                            <span class="help-info" style="display: block">Members who are still experiencing sign-in trouble should email
                                <a href="mailto:dataspace.support@scharp.org?Subject=CAVD%20DataSpace%20request%20for%20information" class="contact">dataspace.support@scharp.org</a>.
                                <br>Note: Your DataSpace password is not necessarily the same as your Atlas and CAVD Portal passwords.
                            </span>
                        </div>
                    </div>

                    <div class="links">
                        <a href="#" data-click="help-register" class="help">Cancel</a>
                        <a href="#" data-click="confirmregisterhelp" class="confirm" id="signinhelpregistersubmit">Submit</a>
                        <input id="submit_hidden_registerhelp" type="submit" style="display: none">
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="create-new-password-modal-popup hidden">
        <div class="create-new-password-modal front-page-popup-container">
            <div class="modal">
                <div class="border"></div>
                <div class="title">
                    <h1>Choose a new password</h1>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form action="" method="post" class="form" id="createnewpasswordform">
                    <div class="credentials">
                        <span class="password-requirements help-info">Your password must be at least 8 characters and must contain three of the following: lowercase letter (a-z), uppercase letter (A-Z), digit (0-9), or symbol (e.g., ! # $ % & / < = > ? @).
                        Additionally, it must not contain a sequence of three or more characters from your email address, display name, first name, or last name and must not match any of your 10 previously used passwords.
                        </span>
                        <input placeholder="Password" id="password1" name="password" type="password" value="" required>
                        <input placeholder="Re-enter Password" id="password2" name="password2" type="password" value="" required>
                        <div class="checkbox"></div>
                    </div>
                    <div class="links">
                        <a href="#" data-click="dismiss" class="dismiss">Cancel</a>
                        <input type="button" data-click="confirmchangepassword" class="confirm" value="Submit" id="createnewpasswordsubmit">
                        <input id="submit_hidden_pw" type="submit" style="display: none">
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="create-account-modal-popup hidden">
        <div class="create-account-modal front-page-popup-container">
            <div class="modal" data-form="account-new-password">
                <div class="border"></div>
                <div class="title">
                    <h1>Create your account</h1>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form action="" method="post" class="form" id="createaccountform">
                    <div class="credentials">
                        <span class="password-requirements help-info">Your password must be at least 8 characters and must contain three of the following: lowercase letter (a-z), uppercase letter (A-Z), digit (0-9), or symbol (e.g., ! # $ % & / < = > ? @).
                        Additionally, it must not contain a sequence of three or more characters from your email address, display name, first name, or last name and must not match any of your 10 previously used passwords.
                        </span>
                        <input placeholder="Password" id="password3" name="password" type="password" value="" required>
                        <input placeholder="Re-enter Password" id="password4" name="reenter-password" type="password" value="" required>
                        <div class="checkbox"></div>
                    </div>
                    <div class="tos">
                        <div class="checkbox">
                            <input type="checkbox" id="tos-create-account" required>
                            <label for="tos-create-account">I will protect restricted data, credit others, and obtain approval to publish.</label>
                        </div>
                        <a href="#" data-click="tos-create-account" class="expand-tos">
                            <strong>I have read, understood, and agreed to the</strong>
                            <strong class="highlight">terms of use.</strong>
                        </a>
                        <div data-action="tos-create-account" class="terms-of-service">
                            <h1>Full Terms of Use agreement</h1>
                            <p>To access and view data in this site must agree to the Terms of Use for CAVD DataSpace below. Please read these terms carefully. By accessing this site you agree to be bound by these terms. These terms are subject to change. Any changes will be incorporated into the terms posted to this site from time to time. If you do not agree with these terms, please do not access the site. If you are not an authorized user of this site you are hereby notified that any access or use of the information herein is strictly prohibited.</p>
                            <h3>General Information</h3>
                            <p>The CAVD DataSpace ("Site") is made available to members and guests of the Collaboration for AIDS Vaccine Discovery (CAVD) by the Statistical Center for HIV/AIDS Research & Prevention ("SCHARP") at the Fred Hutchinson Cancer Research Center ("FHCRC"). The CAVD DataSpace is supported by SCHARP's Vaccine Immunology Statistical Center (VISC) award funded by the Bill & Melinda Gates Foundation. The purpose of the DataSpace is to help accelerate shared progress in the search for an effective HIV vaccine by making the research community more aware of work being done and enabling exploration beyond primary publications.</p>
                            <h3>Limitations on the Use of the Site</h3>
                            <p>You agree to comply with all terms and conditions defined in the <a href="https://www.cavd.org/about/Pages/LegalAgreements.aspx" target="_blank">CAVD Data and Material Sharing Agreement (DMSA)</a>, including the CAVD DMSA Clinical Trials Addendum, Data & Materials Sharing Principles, Master CAVD Confidential Disclosure Agreement, and Master CAVD Material Transfer Agreement.<br/><br/>You agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else's rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component.</p>
                            <h3>Limitations on the Use of Data and Information from the Site</h3>
                            <p>Without the prior written consent of FHCRC, you:</p>
                            <ul>
                                <li>
                                    <p>(i) will not transfer any information or data from the Site to any unauthorized individual or institution;</p>
                                </li>
                                <li>
                                    <p>(ii) will acknowledge the CAVD DataSpace in all written or verbal publications or presentations involving any data or information obtained from the Site or the results of any use of such data and information; or</p>
                                </li>
                                <li>
                                    <p>(iii) will not file for intellectual property protection for any invention made as a result from or from your use of the data from the Site.</p>
                                </li>
                            </ul>
                            <p>No individual identifiers of vaccine trial subjects will be provided to you through the Site. You agree not to use any information or data from the Site, either alone or in conjunction with any other information to establish the individual identities of any of the vaccine trial subjects from whom the data on the Site was obtained.</p>
                            <h3>Modifications to the Site and Terms of Use</h3>
                            <p>FHCRC may at any time modify, replace, refuse access to, suspend or discontinue the Site, partially or entirely, or change and modify all or part of the services for you or for all users in its sole discretion and without notice.<br/><br/>FHCRC reserves the right to modify the Terms of Use at any time without notice, but the most current version of the Terms of Use will always be available to you by clicking on the link at the bottom of the Site. If you find the Terms of Use unacceptable at any time, you may discontinue your use of the Site, but the Terms of Use shall survive such discontinuation with respect to activity occurring prior to such discontinuation. By continuing to use the Site after the date of any change of the Terms of Use, including accessing the Site, you agree to be bound by the provisions contained in the most recent version of the Terms of Use.</p>
                            <h3>Disclaimers</h3>
                            <p>THE SITE AND ALL INFORMATION AND DATA FROM THE SITE ARE PROVIDED "AS IS" AND "AS AVAILABLE". FHCRC DOES NOT WARRANT THE ACCURACY, ADEQUACY OR COMPLETENESS OF THIS INFORMATION AND DATA, AND, TO THE EXTENT PERMITTED BY LAW, FHCRC EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, IMPLIED, EXPRESSED OR STATUTORY INCLUDING THE WARRANTIES OF NON-INFRINGEMENT OF THIRD PARTY RIGHTS, TITLE, MERCHANTABILITY OR QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF INFORMATION, INFORMATION ACCESS, FREEDOM FROM COMPUTER VIRUS OR OTHER HARMFUL ELEMENTS. THE DISCLAIMERS AND EXCLUSIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES.</p>
                            <h3>Limited Liability and Remedy</h3>
                            <p>YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE IS AT YOUR OWN RISK. FHCRC WILL NOT BE LIABLE FOR ANY DAMAGES RELATED TO YOUR USE OF OR INABILITY TO USE THE SITE, INCLUDING WITHOUT LIMITATION, DIRECT, INDIRECT, SPECIAL, COMPENSATORY OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOSS OF OR DAMAGE TO PROPERTY, EVEN IF FHCRC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE LIMITATIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES AND YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE NO REMEDY AGAINST SUCH SUPPLIERS OR SUBCONTRACTORS FOR ANY COSTS OR DAMAGES YOU INCUR ARISING OUT OF, OR RELATING TO YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE.</p>
                            <h3>Indemnity</h3>
                            <p>You agree to indemnify, defend and hold FHCRC and its officers, directors, owners, agents, employees, affiliates, licensees, licensors suppliers and subcontractors harmless from and against all claims, losses, liability, cost, and expenses (including attorneys' fees) arising from your violation of these Terms of Use or misuse of this Site, or any service, product, information or data provided through this Site. Your obligations under this Section will survive your termination of access to or use of this Site, or nonuse of any service, information or data.</p>
                            <h3>Applicable Law</h3>
                            <p>These Terms of Use will be construed according to Washington State law, without regard to provisions governing conflicts of laws. Any dispute arising under or relating to these Terms of Use, the content, the use of the Site, or any services obtained using this Site, will be resolved exclusively by the state and federal courts of the State of Washington. Your use of the Site constitutes your consent to the jurisdiction and venue of such courts with respect to any such dispute.</p>
                        </div>
                        <span class="agree"></span>
                    </div>
                    <div class="links">
                        <a href="#" data-click="dismiss" class="dismiss">Cancel</a>
                        <input type="button" data-click="confirmcreateaccount" class="confirm" value="Submit" id="createaccountsubmit">
                        <input id="submit_hidden_account" type="submit" style="display: none">
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="survey-modal-popup hidden">
        <div class="account-survey-modal front-page-popup-container">

            <div data-form="account-survey">
                <div class="border"></div>
                <div class="title" style="margin-bottom: 0;">
                    <h1>Member details</h1>
                </div>
                <div class="notifications" style="margin-bottom: 0.5em;">
                    <p></p>
                </div>
                <span class="help-info" style="display: block">
                    We're almost there!
                </span>
                <span class="help-info" style="display: block">
                    The DataSpace is a data sharing and discovery tool developed for HIV vaccine researchers. We want to make the community more aware of its own work and encourage self-service exploration of data outside the analyses done in primary publications.
                </span>
                <span class="help-info" style="display: block">
                    Understanding who our members are and their particular areas of interest helps us create a better experience. Please provide us with some additional information about you. Fields marked with * are required.
                </span><br>
                <form action="" method="post" class="form">
                    <div class="form">
                        <div class="credentials survey-form">
                            <table>
                                <tr>
                                    <td class="label"><label>Email</label></td>
                                    <td><label id="verifiedaccountemail"></label></td>
                                </tr>
                                <tr>
                                    <td class="label"><label for="accountfirstname">First Name *</label></td>
                                    <td class="input"><input placeholder="First Name" type="text" id="accountfirstname"
                                                             required></td>
                                </tr>
                                <tr>
                                    <td class="label"><label for="accountlastname">Last Name *</label></td>
                                    <td><input placeholder="Last Name" type="text" id="accountlastname" required></td>
                                </tr>
                                <tr>
                                    <td class="label"><label for="accountinstitution">Primary Institution *</label></td>
                                    <td><input placeholder="Primary Institution" type="text" id="accountinstitution"
                                               required></td>
                                </tr>
                                <tr>
                                    <td class="label"><label for="accountrole">Title/Role *</label></td>
                                    <td><input placeholder="Title/Role" type="text" id="accountrole" required></td>
                                </tr>
                                <tr>
                                    <td class="label"><label for="accountarea">Research areas of interest</label></td>
                                    <td><input placeholder="Research areas of interest" type="text" id="accountarea"
                                               required></td>
                                </tr>
                                <tr>
                                    <td class="label"><label>Network Affiliations (past or present)</label></td>
                                    <td>
                                        <label>Mark all that apply</label>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox9" name="network" value="HIV Vaccine Trials Network (HVTN)">
                                            <label for="net-checkbox9">Collaboration for AIDS Vaccine Discovery (CAVD)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox1" name="network" value="HIV Vaccine Trials Network (HVTN)">
                                            <label for="net-checkbox1">HIV Vaccine Trials Network (HVTN)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox2" name="network" value="International AIDS Vaccine Initiative (IAVI)">
                                            <label for="net-checkbox2">International AIDS Vaccine Initiative (IAVI)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox3" name="network" value="Military HIV Research Program (MHRP)">
                                            <label for="net-checkbox3">Military HIV Research Program (MHRP)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox4" name="network" value="European AIDS Vaccine Initiative (EAVI)">
                                            <label for="net-checkbox4">European AIDS Vaccine Initiative (EAVI)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox5" name="network" value="Center for HIV/AIDS Vaccine Immunology (CHAVI)">
                                            <label for="net-checkbox5">Center for HIV/AIDS Vaccine Immunology (CHAVI)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox6" name="network" value="National Institutes of Health (NIH)">
                                            <label for="net-checkbox6">National Institutes of Health (NIH)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox7" name="network" value="NIH Vaccine Research Center (VRC)">
                                            <label for="net-checkbox7">NIH Vaccine Research Center (VRC)</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="net-checkbox8">
                                            <label for="net-checkbox8">Other, specify</label>
                                            <input placeholder="Other network affiliations" type="text"
                                                   id="accountothernetwork">
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label"><label>How did you hear about the DataSpace?</label></td>
                                    <td>
                                        <label>Mark all that apply</label>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox1" name="referrer" value="Conference">
                                            <label for="ref-checkbox1">Conference</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox2" name="referrer" value="Class or professor reference">
                                            <label for="ref-checkbox2">Class or professor reference</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox3" name="referrer" value="Google search">
                                            <label for="ref-checkbox3">Google search</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox4" name="referrer" value="Referred by a colleague">
                                            <label for="ref-checkbox4">Referred by a colleague</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox5" name="referrer" value="Newsletter">
                                            <label for="ref-checkbox5">Newsletter</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox6" name="referrer" value="Publication">
                                            <label for="ref-checkbox6">Publication</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox7" name="referrer" value="Twitter">
                                            <label for="ref-checkbox7">Twitter</label>
                                        </div>
                                        <div class="checkbox checkboxgroup">
                                            <input type="checkbox" id="ref-checkbox8">
                                            <label for="ref-checkbox8">Others, specify</label>
                                            <input placeholder="How did you hear about us?" type="text"
                                                   id="accountotherreferrer">
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div class="links">
                        <input id="submit_hidden_account_survey" type="submit" style="display: none">
                        <input type="button" data-click="confirmsurvey" class="confirm" value="Submit"
                               id="accountsurveysubmit">
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="fullpage">
        <div data-index='1' data-name="Welcome" class="section intro-section">
            <div class="links">
                <span>CAVD DataSpace Members:</span>
                <a href="#" class="create-account-modal-trigger">Create Account</a>
                <a href="#" class="signin-modal-trigger front-page-button">Sign In</a>
            </div>
            <div class="links sublink sign-in1">
                <span>Don't have an account?</span>
                <a href="#" class="register-modal-trigger front-page-button">Register Here</a>
            </div>
            <div class="welcome" style="margin-bottom: unset">
                <div class="title" style="margin-bottom: unset">
                    <h1></h1>
                    <h1>Welcome to the</h1>
                    <h1>CAVD DataSpace</h1>
                </div>
            </div>
            <div class="learn-more" style="max-width:unset;">
                <div class="container" style="margin-top: unset;">
                    <h3>A data sharing and discovery tool for HIV vaccine research</h3>
                </div>
            </div>
            <div class="video-container">
                <a href="#" class="video-placeholder video-modal-trigger">
                    <div class="play"></div>
                </a>
                <div class="video-modal-popup hidden">
                    <div data-js-id="video-modal">
                        <div class="video-header">
                            <button title="Close (Esc)" type="button" class="video-close mfp-close">x</button>
                        </div>

                        <div id="intro-video" poster="<%=getWebappURL("/frontpage/img/intro.jpg")%>" class="video-js">
                            <iframe src="https://player.vimeo.com/video/142939542?color=ff9933&title=0&byline=0&portrait=0" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

                        </div>
                    </div>
                </div>
            </div>
            <div class="learn-more">
                <p>Learn, discover and collaborate on data</p>
                <p>from dozens of HIV vaccine studies.</p>
                <div class="container">
                    <h3>Learn more</h3>
                </div>
            </div>
            <a href="#" class="circle move-section-down">
                <div class="arrow"></div>
            </a>
        </div>
        <div data-index='2' data-gif="/img/learn.gif" data-name="Always Growing" class="section learn-section">
            <div class="container">
                <h1>Always Growing</h1>
            </div>
            <div class="statistics">
                <div class="timestamp">
                    <p>Updated </p>
                    <p class="days">-</p>
                    <p>days ago.</p>
                </div>
                <div class="counts">
                    <div class="products datapoint">
                        <div class="value">
                            <h1>-</h1>
                        </div>
                        <div class="title">
                            <p>Products</p>
                        </div>
                    </div>
                    <div class="studies datapoint">
                        <div class="value">
                            <h1>-</h1>
                        </div>
                        <div class="title">
                            <p>Studies</p>
                        </div>
                    </div>
                    <div class="subjects datapoint">
                        <div class="value">
                            <h1>-</h1>
                        </div>
                        <div class="title">
                            <p>Subjects</p>
                        </div>
                    </div>
                    <div class="assays datapoint">
                        <div class="value">
                            <h1>-</h1>
                        </div>
                        <div class="title">
                            <p>Assays</p>
                        </div>
                    </div>
                </div>
                <div class="reminder">
                    <p>Our team regularly adds new data</p>
                    <p>as it becomes available.</p>
                </div>
            </div>
            <a href="#" class="circle move-section-down">
                <div class="arrow"></div>
            </a>
        </div>
        <div data-index='3' data-name="Our Goal" class="section goal-section">
            <div class="goal-container">
                <div class="title">
                    <h1>Our goal</h1>
                </div>
                <div class="copy">
                    <p>The Global HIV Vaccine Enterprise called for a "dramatic shift in the
                        <br>
                        culture and practice of sharing research data," and UNAIDS demanded,
                        <br>
                        "faster, smarter, better" programs. Solutions will come from collective
                        <br>
                        efforts and strong community interaction.
                        <br>
                        <br>
                    </p>
                    <p>We believe data that have been published are not exhausted. With easy
                        <br>
                        access and simple tools, more scientists can answer more questions and
                        <br>
                        find new hypotheses. The DataSpace is a test of these ideas and we will
                        <br>
                        measure its value.
                    </p>
                </div>
                <a href="#" class="circle move-section-down">
                    <div class="arrow"></div>
                </a>
            </div>
        </div>
        <div data-index='4' data-gif="<%=getWebappURL("/frontpage/img/learn.gif")%>" data-name="Learn" class="section learn-section">
            <div class="gif-title">
                <h1>Learn</h1>
            </div>
            <div class="gif-container learn">
                <img src="<%=getWebappURL("/frontpage/img/learn.png")%>" class="placeholder">
                <img src="<%=getWebappURL("/frontpage/img/learn-complete.png")%>" class="mobile-img">
                <div class="gif-description">
                    <p>Learn details about dozens of studies, vaccines, and assays
                        to avoid covering trodden ground and give context to new
                        proposals. </p>
                </div>
            </div>
            <a href="#" class="circle move-section-down">
                <div class="arrow"></div>
            </a>
        </div>
        <div data-index='5' data-gif="<%=getWebappURL("/frontpage/img/explore.gif")%>" data-name="Explore" class="section explore-section">
            <div class="gif-title">
                <h1>Explore</h1>
            </div>
            <div class="gif-container explore">
                <img src="<%=getWebappURL("/frontpage/img/explore.png")%>" class="placeholder">
                <img src="<%=getWebappURL("/frontpage/img/explore-complete.png")%>" class="mobile-img">
                <div class="gif-description">
                    <p>Find relationships among subjects from many studies,
                        filter to characteristics of interest, and quickly visualize
                        or export to test ideas.</p>
                </div>
            </div>
            <a href="#" class="circle move-section-down">
                <div class="arrow"></div>
            </a>
        </div>
        <div data-index='6' data-gif="<%=getWebappURL("/frontpage/img/collab.gif")%>" data-name="Collaborate" class="section collab-section">
            <div class="gif-title">
                <h1>Collaborate</h1>
            </div>
            <div class="gif-container collab">
                <img src="<%=getWebappURL("/frontpage/img/collab.png")%>" class="placeholder">
                <img src="<%=getWebappURL("/frontpage/img/collab-complete.png")%>" class="mobile-img">
                <div class="gif-description">
                    <p>Find a contact for every product, assay, and study for
                        clarification or to explore a new idea together.</p>
                </div>
            </div>
            <a href="#" class="circle move-section-down">
                <div class="arrow"></div>
            </a>
        </div>
        <div data-index='7' data-name="About" class="section about-section">
            <div class="about-container">
                <div class="title">
                    <h1>About</h1>
                </div>
                <div class="copy">
                    <p>The DataSpace is a collaboration between
                        <a href="http://www.scharp.org" target="_blank">SCHARP</a>,
                        <a href="http://www.labkey.com" target="_blank">LabKey</a>, and
                        <a href="http://www.artefactgroup.com" target="_blank">Artefact.<br></a>
                        <a href="http://www.gatesfoundation.org/" target="_blank">The Bill & Melinda Gates Foundation</a>,
                        has funded the program to date.
                        <br>
                        The DataSpace is open to the public.
                    </p>
                </div>
                <div class="links">
                    <a href="mailto:dataspace.support@scharp.org?Subject=CAVD%20DataSpace%20request%20for%20information" class="contact">Contact Us</a>

                    <a href="#" class="email-modal-trigger">
                        Sign up for our mailing list
                    </a>
                    <div class="email-modal-popup hidden">
                        <div class="email-modal">
                            <div class="border"></div>
                            <!-- Begin MailChimp Signup Form -->
                            <!-- <link href="//cdn-images.mailchimp.com/embedcode/slim-081711.css" rel="stylesheet" type="text/css">-->
                            <style type="text/css">
                                #mc_embed_signup {
                                    background:#fff;
                                    clear:left;
                                    font: 14px Helvetica,Arial,sans-serif;
                                }
                                /* Add your own MailChimp form style overrides in your site stylesheet or in this style block.
                                   We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */
                            </style>
                            <div id="mc_embed_signup">
                                <form action="//cavd.us12.list-manage.com/subscribe/post?u=94b15dde08aa6cdccdf310066&amp;id=647228cd30" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
                                    <div id="mc_embed_signup_scroll">
                                    <p class="title">No more than once a month, we may share updates about our future plans, the impact we're seeing, or opportunities to engage with our team at conferences. It's easy to unsubscribe at any time.</p>
                                    <label for="mce-EMAIL">Email Address</label>
                                    <input type="email" value="" name="EMAIL" class="email" id="mce-EMAIL" placeholder="email address" required>
                                    <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                                    <div style="position: absolute; left: -5000px;"><input type="text" name="b_94b15dde08aa6cdccdf310066_647228cd30" tabindex="-1" value=""></div>
                                    <div class="clear"><input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"></div>
                                    </div>
                                </form>
                            </div>

                            <!--End mc_embed_signup-->
                        </div>
                    </div>

                    <a href="https://twitter.com/CAVDDataSpace" class="twitter" target="_blank">
                        <span class="twitter-logo"></span>
                    </a>

                </div>
                <div class="links sign-in">
                    <span>CAVD DataSpace Members:</span>
                    <a href="#" class="create-account-modal-trigger">Create Account</a>
                    <p></p>
                    <a href="#" class="signin-modal-trigger front-page-button">Sign In</a>
                </div>
                <div class="links sublink sign-in">
                    <span>Don't have an account?</span>
                    <a href="#" class="register-modal-trigger front-page-button">Register Here</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
