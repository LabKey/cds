/*
 * Copyright (c) 2014-2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.TermsOfUse', {

    extend : 'Ext.Component',

    alias  : 'widget.terms',

    cls : 'terms-of-use',

    data : {},

    tpl : new Ext.XTemplate(
        '<tpl>',
        '<section class="terms-block">',
            '<h4>General Information</h4>',

            '<p>',
                'The CAVD DataSpace (“Site”) is made available to members and trusted entities of the Collaboration for AIDS Vaccine Discovery (CAVD) by the Statistical Center for HIV/AIDS Research & Prevention ("SCHARP") at the Fred Hutchinson Cancer Research Center ("FHCRC"). The CAVD DataSpace is a pilot project in support of SCHARP\'s Vaccine Immunology Statistical Center (VISC) award funded by the Bill & Melinda Gates Foundation. The purpose of the project is to help accelerate shared progress in the search for an effective HIV vaccine by making the community more aware of work being done and enabling exploration beyond primary publications.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>Limitations on the Use of the Site</h4>',

            '<p>',
                'You agree to comply with all terms and conditions defined <a href="https://www.cavd.org/about/Pages/LegalAgreements.aspx" target="_blank">in the CAVD Data and Material Sharing Agreement</a>.<br/><br/>You agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else\'s rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>Limitations on the Use of Data and Information from the Site</h4>',

            '<p>',
                'Without the prior written consent of FHCRC, you:<br/><br/>(i) will not use information or data from the Site for any purpose other than the design, testing and evaluation of the Site,<br/>(ii) will not transfer any information or data from the Site to any other individual or institution;<br/>(iii) will not publish or present any of data or information obtained from the Site or the results of any use of such data and information; or<br/>(iv) will not file for intellectual property protection for any invention made as a result from or from your use of the data from the Site.<br/><br/>No individual identifiers of vaccine trial subjects will be provided to you through the Site. You agree not to use any information or data from the Site, either alone or in conjunction with any other information to establish the individual identities of any of the vaccine trial subjects from whom the data on the Site was obtained. Unless otherwise approved in writing by the FHCRC, upon the completion of your use of data contained on this Site for the design, testing and/or evaluation of the Site or at the end of the project, whichever is first, you agree to discontinue use of and destroy any and all data or information obtained from the Site. You will provide prompt written notice of such destruction to FHCRC.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>Modifications to the Site and Terms of Use</h4>',

            '<p>',
                'FHCRC may at any time modify, replace, refuse access to, suspend or discontinue the Site, partially or entirely, or change and modify all or part of the services for you or for all users in its sole discretion and without notice.<br/><br/>FHCRC reserves the right to modify the Terms of Use at any time without notice, but the most current version of the Terms of Use will always be available to you by clicking on the link at the bottom of the Site. If you find the Terms of Use unacceptable at any time, you may discontinue your use of the Site, but the Terms of Use shall survive such discontinuation with respect to activity occurring prior to such discontinuation. By continuing to use the Site after the date of any change of the Terms of Use, including accessing the Site, you agree to be bound by the provisions contained in the most recent version of the Terms of Use.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>Disclaimers</h4>',

            '<p>',
                'THE SITE AND ALL INFORMATION AND DATA FROM THE SITE ARE PROVIDED "AS IS" AND "AS AVAILABLE". FHCRC DOES NOT WARRANT THE ACCURACY, ADEQUACY OR COMPLETENESS OF THIS INFORMATION AND DATA, AND, TO THE EXTENT PERMITTED BY LAW, FHCRC EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, IMPLIED, EXPRESSED OR STATUTORY INCLUDING THE WARRANTIES OF NON-INFRINGEMENT OF THIRD PARTY RIGHTS, TITLE, MERCHANTABILITY OR QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF INFORMATION, INFORMATION ACCESS, FREEDOM FROM COMPUTER VIRUS OR OTHER HARMFUL ELEMENTS. THE DISCLAIMERS AND EXCLUSIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC\'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>Limited Liability and Remedy</h4>',

            '<p>',
                'YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE IS AT YOUR OWN RISK. FHCRC WILL NOT BE LIABLE FOR ANY DAMAGES RELATED TO YOUR USE OF OR INABILITY TO USE THE SITE, INCLUDING WITHOUT LIMITATION, DIRECT, INDIRECT, SPECIAL, COMPENSATORY OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOSS OF OR DAMAGE TO PROPERTY, EVEN IF FHCRC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. THE LIMITATIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC\'S SUPPLIERS AND SUBCONTRACTORS, AS THIRD PARTY BENEFICIARIES AND YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE NO REMEDY AGAINST SUCH SUPPLIERS OR SUBCONTRACTORS FOR ANY COSTS OR DAMAGES YOU INCUR ARISING OUT OF, OR RELATING TO YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>Indemnity</h4>',
            '<p>',
                'You agree to indemnify, defend and hold FHCRC and its officers, directors, owners, agents, employees, affiliates, licensees, licensors suppliers and subcontractors harmless from and against all claims, losses, liability, cost, and expenses (including attorneys\' fees) arising from your violation of these Terms of Use or misuse of this Site, or any service, product, information or data provided through this Site. Your obligations under this Section will survive your termination of access to or use of this Site, or nonuse of any service, information or data.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>Applicable Law</h4>',
            '<p>',
                'These Terms of Use will be construed according to Washington law, without regard to provisions governing conflicts of laws. Any dispute arising under or relating to these Terms of Use, the content, the use of the Site, or any services obtained using this Site, will be resolved exclusively by the state and federal courts of the State of Washington. Your use of the Site constitutes your consent to the jurisdiction and venue of such courts with respect to any such dispute.',
            '<p>',
        '</section>',
        '</tpl>')
});


