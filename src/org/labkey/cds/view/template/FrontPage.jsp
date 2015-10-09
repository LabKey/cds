<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    String contextPath = request.getContextPath();
    String appPath = contextPath + "/Connector";
    String frontPagePath = appPath + "/frontPage";
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
    <link rel="stylesheet" href="<%=text(frontPagePath)%>/components/video.js/dist/video-js/video-js.min.css">
    <style type="text/css">
        /* Context-sensitive url */
        .section.intro-section .video-container .video-placeholder {
            background-image: url(<%=text(frontPagePath)%>/img/intro.png);
        }
    </style>

    <link rel="icon" type="image/png" href="<%=text(frontPagePath)%>/img/icon.png">

    <!-- Include base labkey.js -->
    <%=PageFlowUtil.getLabkeyJS(getViewContext(), new LinkedHashSet<>())%>
    <script data-main="<%=text(frontPagePath)%>/js/config" src="<%=text(frontPagePath)%>/components/requirejs/require.js"></script>
</head>
<body>
    <div id="navigation">
        <div class="icon">
            <div class="img">
                <img src="<%=text(frontPagePath)%>/img/icon.png">
            </div>
        </div>
        <div class="title">
            <strong>CAVD</strong>
            <p>DataSpace</p>
        </div>
        <div class="links">
            <div class="link hide sign-in">
                <span>CAVD Members:</span>
                <a href="#" class="signin-modal-trigger">Sign In</a>
            </div>
        </div>
    </div>
    <div class="signin-modal-popup hidden">
        <div class="signin-modal">
            <div data-form="sign-in" class="sign-in">
                <div class="border"></div>
                <div class="title">
                    <h1>CAVD member sign-in</h1>
                </div>
                <div class="notifications">
                    <p></p>
                </div>
                <form class="form">
                    <div class="credentials">
                        <input placeholder="Email" type="email" id="email" name="email" value="" required>
                        <input placeholder="Password" name="password" id="password" type="password" value="" required>
                        <div class="checkbox">
                            <input type="checkbox" id="remember-me-checkbox">
                            <label for="remember-me-checkbox">Remember Me</label>
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
                            <p>To access and view data in this site you much agree to the Terms of User for CAVD DataSpace below. Please read these terms carefully. By accessing this site you agree to be bound by these terms. These terms are subject to change. Any changes will be incorporated into the terms posted to this site from time to time. If you do not agree with these terms, please do not access the site. If you are not an authorized user of this site you are hereby notified that any access or use of the information herein is strictly prohibited.</p>
                            <h3>GENERAL INFORMATION</h3>
                            <p>The Collaborative Data Space Portal ("Site") is made available by the Statistical Center for HIV/AIDS Research & Prevention ("SCHARP") at Fred Hutchinson Cancer Research Center ("FHCRC") as a test site in support of SCHARP’s project entitled “The HIV Vaccine Research Collaborative Data Space? (“Project?). The purpose of the Project is to design a pilot infrastructure for depositing, annotating, accessing and analyzing research data.</p>
                            <h3>EXTERNAL LINKS</h3>
                            <p>Some of the Site pages may provide links to outside internet websites for your convenience. FHCRC is not responsible for the availability or content of these outside sites, nor does FHCRC endorse, warrant or guarantee (i) the products, services or information described or offered at these outside sites, (ii) the outside sites themselves or (iii) the companies maintaining the outside sites. Your use of any outside site is at your own risk. If you choose to access an outside site through links on the Site’s pages, you accept responsibility for all related risks.</p>
                            <h3>LIMITATIONS ON THE USE OF THE SITE</h3>
                            <p>You agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else's rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component. You further agree that your use of the Site will, at all times, comply with the IBM Acceptable Use Policy located on the Internet at www.ibm.com/services/e-business/aup.html and any subsequent modification</p>
                            <h3>LIMITATIONS ON THE USE OF DATA AND INFORMATION FROM THE SITE</h3>
                            <p>Without the prior written consent of FHCRC, you:</p>
                            <ul>
                                <li>
                                    <p>(i) will not use information or data from the Site for any purpose other than the design, testing and evaluation of the Site for the Project,</p>
                                </li>
                                <li>
                                    <p>(ii) will not transfer any information or data from the Site to any other individual or institution;</p>
                                </li>
                                <li>
                                    <p>(iii) will not publish or present any of data or information obtained from the Site or the results of any use of such data and information; or</p>
                                </li>
                                <li>
                                    <p>(iv) will not file for intellectual property protection for any invention made as a result from or from your use of the data from the Site.</p>
                                </li>
                            </ul>
                            <p>No individual identifiers of vaccine trial participants will be provided to you through the Site. You agree not be use any information or data from the Site, either alone or in conjunction with any other information to establish the individual identities of any of the vaccine trial participants from whom the data on the Site was obtained. Unless otherwise approved in writing by the data providers, upon the completion of your use of data contained on this Site for the design, testing and/or evaluation of the Site or at the end of the Project, whichever is first, you agree to discontinue use of and destroy any and all data or information obtained from the Site. You will provide prompt written notice of such destruction to FHCRC.</p>
                            <h3>ADDITIONAL TERMS AND CONDITIONS</h3>
                            <p>If you access the MHRP datasets, you agree to additional terms and conditions. Review the additional terms and condition for access to the MHRP dataset here.</p>
                            <p>If you access the CHAVI datasets, you agree to additional terms and conditions. Review the additional terms and condition for access to the CHAVI dataset here.</p>
                            <h3>INSTITUTIONAL AND IRB APPROVALS</h3>
                            <p>You represent and warrant (i) that you have obtained all institutional approvals required by the institution by whom you are employed for your use of the Site and data and information from the Site and (ii) that you have obtained approval from your institution’s Institutional Review Board, or equivalent body, for your use of data and information from the Site to the extent required by law and your institution.</p>
                            <h3>DISCLAIMERS</h3>
                            <p>THE SITE AND ALL INFORMATION AND DATA FROM THE SITE ARE PROVIDED "AS IS" AND "AS AVAILABLE". FHCRC DOES NOT WARRANT THE ACCURACY, ADEQUACY OR COMPLETENESS OF THIS INFORMATION AND DATA, AND, TO THE EXTENT PERMITTED BY LAW, FHCRC EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, IMPLIED, EXPRESSED OR STATUTORY INCLUDING THE WARRANTIES OF NON-INFRINGEMENT OF THIRD PARTY RIGHTS, TITLE, MERCHANTABILITY OR QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF INFORMATION, INFORMATION ACCESS, FREEDOM FROM COMPUTER VIRUS OR OTHER HARMFUL ELEMENTS. THE DISCLAIMERS AND EXCLUSIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC’S SUPPLIERS AND SUBCONTRACTORS, INCLUDING IBM, AS THIRD PARTY BENEFICIARIES.</p>
                            <h3>LIMITED LIABILITY AND REMEDY</h3>
                            <p>YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE IS AT YOUR OWN RISK. FHCRC WILL NOT BE LIABLE FOR ANY DAMAGES RELATED TO YOUR USE OF OR INABILITY TO USE THE SITE, INCLUDING WITHOUT LIMITATION, DIRECT, INDIRECT, SPECIAL, COMPENSATORY OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOSS OF OR DAMAGE TO PROPERTY, EVEN IF FHCRC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE LIMITATIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC’S SUPPLIERS AND SUBCONTRACTORS, INCLUDING IBM, AS THIRD PARTY BENEFICIARIES AND YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE NO REMEDY AGAINST SUCH SUPPLIERS OR SUBCONTRACTORS FOR ANY costs or damages YOU INCUR ARISING OUT OF, OR RELATING TO YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE.</p>
                            <h3>MODIFICATIONS TO THE SITE AND TERMS OF USE</h3>
                            <p>FHCRC may at any time modify, replace, refuse access to, suspend or discontinue the Site, partially or entirely, or change and modify all or part of the services for you or for all users in its sole discretion and without notice.</p>
                            <p>FHCRC reserves the right to modify the Terms of Use at any time without notice, but the most current version of the Terms of Use will always be available to you by clicking on the link at the bottom of the Site. If you find the Terms of Use unacceptable at any time, you may discontinue your use of the Site, but the Terms of Use shall survive such discontinuation with respect to activity occurring prior to such discontinuation. By continuing to use the Site after the date of any change of the Terms of Use, including accessing the Site, you agree to be bound by the provisions contained in the most recent version of the Terms of Use.</p>
                            <h3>INDEMNITY</h3>
                            <p>You agree to indemnify, defend and hold FHCRC and its officers, directors, owners, agents, employees, affiliates, licensees, licensors suppliers and subcontractors (including IBM) harmless from and against all claims, losses, liability, cost, and expenses (including attorneys' fees) arising from your violation of these Terms of Use or misuse of this Site, or any service, product, information or data provided through this Site. Your obligations under this Section will survive your termination of access to or use of this Site, or nonuse of any service, information or data.</p>
                            <h3>APPLICABLE LAW</h3>
                            <p>These Terms of Use will be construed according to Washington law, without regard to provisions governing conflicts of laws. Any dispute arising under or relating to these Terms of Use, the content, the use of the Site, or any services obtained using this Site, will be resolved exclusively by the state and federal courts of the State of Washington. Your use of the Site constitutes your consent to the jurisdiction and venue of such courts with respect to any such dispute.</p>
                            <h3>ADDITIONAL TERMS AND CONDITIONS FOR ACCESS TO AND USE OF THE MHRP DATA SET.</h3>
                            <p>The MHRP data is derived from RV144 study samples which were provided to MHRP under the terms of a material transfer agreement (“MTA��?) with the Ministry of Public Health (hereinafter “MOPH?), Thailand, on behalf of the MOPH-TAVEG (Thai AIDS Vaccine Evaluation Group) Collaboration (see the MTA here), and is made available as a service to the research community.</p>
                            <p>In addition to the general terms and conditions for access to Site, you agree that:</p>
                            <ul>
                                <li>
                                    <p>(i) you will use the MHRP data solely for the CDS Pilot Project and consistently with the MTA the terms of which may be found here,</p>
                                </li>
                                <li>
                                    <p>(ii) you will not disclose the MHRP data or the results from the MHRP data without specific agreement from the MHRP and the MOPH-TAVEG Collaboration,</p>
                                </li>
                                <li>
                                    <p>(iii) you will immediately notify MHRP and FHCRC in writing if the MHRP Data or use or the MHRP data results in new inventions intellectual property to permit notification of the U.S. Government of the existence of such new intellectual property, and</p>
                                </li>
                                <li>
                                    <p>(iv) you will provide all patent applications to MHRP and notification to FHCRC that you have provided such application to MHRP thirty (30) days prior to submission and public disclosure to allow MHRP to review and seek approval from the MOPH-TAVEG Collaboration.</p>
                                </li>
                            </ul>
                            <h3>ADDITIONAL TERMS AND CONDITIONS FOR ACCESS TO AND USE OF THE CHAVI DATA SET</h3>
                            <p>In addition to the general terms and conditions for access to Site, you agree that:</p>
                            <ul>
                                <li>
                                    <p>(i) you will not disclose the CHAVI data or the results from the CHAVI data without specific agreement with CHAVI,</p>
                                </li>
                                <li>
                                    <p>(ii) you will use the CHAVI data solely for developing the database infrastructure in the CDS Pilot Project, and</p>
                                </li>
                                <li>
                                    <p>(iii) you will not file patent applications directed to inventions developed from the CHAVI data or results from the CHAVI data</p>
                                </li>
                            </ul>
                        </div>
                        <span class="agree"></span>
                    </div>
                    <div class="links">
                        <input type="button" value="Submit" data-click="confirm" class="confirm">
                        <input id="submit_hidden" type="submit" style="display: none">
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div id="fullpage">
        <div data-index='1' data-name="Welcome" class="section intro-section">
            <div class="links">
                <span>CAVD Members:</span>
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
                    <div class="video-header">
                        <button title="Close (Esc)" type="button" class="video-close mfp-close">×</button>
                    </div>
                    <video id="intro-video" controls preload="auto" width="304" height="160" poster="<%=text(frontPagePath)%>/img/intro.png" class="video-js vjs-default-skin">
                        <source src="<%=text(frontPagePath)%>/img/intro.mp4" type="video/mp4">
                        <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that
                            <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
                        </p>
                    </video>
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
                    <p>The CDS is a collaboration between
                        <a href="http://www.scharp.org">SCHARP</a>,
                        <a href="http://www.labkey.org">LabKey</a>, and
                        <a href="http://www.artefactgroup.com">Artefact.
                            <br>
                        </a>The Bill & Melinda Gates Foundation has funded the program to date.
                        <br>
                        The CDS is currently available to CAVD members.
                    </p>
                </div>
                <div class="links">
                    <a href="mailto:" class="contact">Contact Us</a>
                </div>
                <div class="links sign-in">
                    <span>CAVD Members:</span>
                    <a href="#" class="signin-modal-trigger">Sign In</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
