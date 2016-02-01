<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    String contextPath = request.getContextPath();
    String appPath = contextPath + "/Connector";
    String frontPagePath = contextPath + "/frontPage";
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>CAVD DataSpace</title>
    <link rel="stylesheet" href="<%=text(frontPagePath)%>/css/application.css">
    <link rel="stylesheet" href="<%=text(frontPagePath)%>/components/fullpage.js/jquery.fullPage.css">
    <link rel="stylesheet" href="<%=text(frontPagePath)%>/components/magnific-popup/dist/magnific-popup.css">
    <style type="text/css">
        /* Context-sensitive url */
        .section.intro-section .video-container .video-placeholder {
            background-image: url(<%=text(frontPagePath)%>/img/intro.jpg);
        }
    </style>

    <link rel="icon" type="image/png" href="<%=text(frontPagePath)%>/img/headerlogo.png">

    <!-- Include base labkey.js -->
    <%=PageFlowUtil.getLabkeyJS(getViewContext(), new LinkedHashSet<>())%>
    <script data-main="<%=text(frontPagePath)%>/js/config" src="<%=text(frontPagePath)%>/components/requirejs/require.js"></script>

    <%--<!-- Client API Dependencies -->--%>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/Utils.js"></script>
    <script type="text/javascript" src="<%=text(contextPath)%>/clientapi/core/ActionURL.js"></script>
</head>
<body>
    <div id="navigation">
        <div class="icon" data-js-id="frontPageHomeIcon">
            <div class="img">
                <img src="<%=text(frontPagePath)%>/img/icon.png">
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
                <a href="#" class="signin-modal-trigger">Sign In</a>
            </div>
        </div>
    </div>
    <div class="signin-modal-popup hidden">
        <div class="signin-modal">
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
                            <p>The CAVD DataSpace ("Site") is made available to members and trusted entities of the Collaboration for AIDS Vaccine Discovery (CAVD) by the Statistical Center for HIV/AIDS Research & Prevention ("SCHARP") at the Fred Hutchinson Cancer Research Center ("FHCRC"). The CAVD DataSpace is a pilot project in support of SCHARP's Vaccine Immunology Statistical Center (VISC) award funded by the Bill & Melinda Gates Foundation. The purpose of the project is to help accelerate shared progress in the search for an effective HIV vaccine by making the community more aware of work being done and enabling exploration beyond primary publications.</p>
                            <h3>Limitations on the Use of the Site</h3>
                            <p>You agree to comply with all terms and conditions defined in the <a href="https://www.cavd.org/about/Pages/LegalAgreements.aspx" target="_blank">CAVD Data and Material Sharing Agreement</a>, including the Data & Materials Sharing Principles, Master CAVD Confidential Disclosure Agreement, and Master CAVD Material Transfer Agreement.<br/><br/>You agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else's rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component.</p>
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
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <div class="form">
                    <div class="credentials">
                        <span class="reset">To reset your password, type in your email address and click the submit button.</span>
                        <input placeholder="Email" type="email" id="emailhelp">
                    </div>
                </div>
                <div class="links">
                    <a href="#" data-click="help" class="help">Cancel</a>
                    <a href="#" data-click="confirmhelp" class="confirm" id="signinhelpsubmit">Submit</a>
                </div>
            </div>
        </div>
    </div>
    <div class="create-new-password-modal-popup hidden">
        <div class="create-new-password-modal">
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
                        <span class="password-requirements">Password must be at least 8 characters, and must contain at least one letter and one number.</span>
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
        <div class="create-account-modal">
            <div class="modal">
                <div class="border"></div>
                <div class="title">
                    <h1>Create your account</h1>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form action="" method="post" class="form" id="createaccountform">
                    <div class="credentials">
                        <span class="password-requirements">Password must be at least 8 characters, and must contain at least one letter and one number.</span>
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
                            <p>The CAVD DataSpace ("Site") is made available to members and trusted entities of the Collaboration for AIDS Vaccine Discovery (CAVD) by the Statistical Center for HIV/AIDS Research & Prevention ("SCHARP") at the Fred Hutchinson Cancer Research Center ("FHCRC"). The CAVD DataSpace is a pilot project in support of SCHARP's Vaccine Immunology Statistical Center (VISC) award funded by the Bill & Melinda Gates Foundation. The purpose of the project is to help accelerate shared progress in the search for an effective HIV vaccine by making the community more aware of work being done and enabling exploration beyond primary publications.</p>
                            <h3>Limitations on the Use of the Site</h3>
                            <p>You agree to comply with all terms and conditions defined in the <a href="https://www.cavd.org/about/Pages/LegalAgreements.aspx" target="_blank">CAVD Data and Material Sharing Agreement</a>, including the Data & Materials Sharing Principles, Master CAVD Confidential Disclosure Agreement, and Master CAVD Material Transfer Agreement.<br/><br/>You agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else's rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component.</p>
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
    <div id="fullpage">
        <div data-index='1' data-name="Welcome" class="section intro-section">
            <div class="links">
                <span>CAVD DataSpace Members:</span>
                <a href="#" class="create-account-modal-trigger">Create Account</a>
                <a href="#" class="signin-modal-trigger">Sign In</a>
            </div>
            <div class="welcome">
                <div class="title">
                    <h1>Welcome to the</h1>
                    <h1>CAVD DataSpace</h1>
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

                        <div id="intro-video" poster="<%=text(frontPagePath)%>/img/intro.jpg" class="video-js">
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
                        find new hypotheses. The CDS is a test of these ideas and we will
                        <br>
                        measure its value.
                    </p>
                </div>
                <a href="#" class="circle move-section-down">
                    <div class="arrow"></div>
                </a>
            </div>
        </div>
        <div data-index='4' data-gif="<%=text(frontPagePath)%>/img/learn.gif" data-name="Learn" class="section learn-section">
            <div class="gif-title">
                <h1>Learn</h1>
            </div>
            <div class="gif-container learn">
                <img src="<%=text(frontPagePath)%>/img/learn.png" class="placeholder">
                <img src="<%=text(frontPagePath)%>/img/learn-complete.png" class="mobile-img">
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
        <div data-index='5' data-gif="<%=text(frontPagePath)%>/img/explore.gif" data-name="Explore" class="section explore-section">
            <div class="gif-title">
                <h1>Explore</h1>
            </div>
            <div class="gif-container explore">
                <img src="<%=text(frontPagePath)%>/img/explore.png" class="placeholder">
                <img src="<%=text(frontPagePath)%>/img/explore-complete.png" class="mobile-img">
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
        <div data-index='6' data-gif="<%=text(frontPagePath)%>/img/collab.gif" data-name="Collaborate" class="section collab-section">
            <div class="gif-title">
                <h1>Collaborate</h1>
            </div>
            <div class="gif-container collab">
                <img src="<%=text(frontPagePath)%>/img/collab.png" class="placeholder">
                <img src="<%=text(frontPagePath)%>/img/collab-complete.png" class="mobile-img">
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
                        The DataSpace is currently available to CAVD members.
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
                </div>
                <div class="links sign-in">
                    <span>CAVD DataSpace Members:</span>
                    <a href="#" class="create-account-modal-trigger">Create Account</a>
                    <p></p>
                    <a href="#" class="signin-modal-trigger">Sign In</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
