/*
 * Copyright (c) 2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
Ext.define('Connector.view.TermsOfUse', {

    extend : 'Ext.Component',

    alias  : 'widget.terms',

    cls : 'terms-of-use',

    tpl : new Ext.XTemplate(
        '<tpl>',
        '<section class="terms-block">',
            '<h4>',
                'General Information',
            '</h4>',

            '<p>',
            'The Collaborative Data Space Portal ("Site") is made available by the Statistical Center for HIV/AIDS Research & Prevention ("SCHARP") at Fred Hutchinson Cancer Research Center ("FHCRC") as a test site in support of SCHARP’s project entitled “The HIV Vaccine Research Collaborative Data Space” (“Project”). The purpose of the Project is to design a pilot infrastructure for depositing, annotating, accessing and analyzing research data.',
            '</p>',
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'External Links',
            '</h4>',

            '<p>',
            'Some of the Site pages may provide links to outside internet websites for your convenience. FHCRC is not responsible for the availability or content of these outside sites, nor does FHCRC endorse, warrant or guarantee (i) the products, services or information described or offered at these outside sites, (ii) the outside sites themselves or (iii) the companies maintaining the outside sites.  Your use of any outside site is at your own risk.  If you choose to access an outside site through links on the Site’s pages, you accept responsibility for all related risks.',
            '</p>',
             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Limitations on the Use of the Site',
            '</h4>',

            '<p>',
            'You agree (i) to make only lawful use of the Site in compliance with all applicable federal, state and local laws and regulations, (ii) not to permit unauthorized users to have access to or to view information or data on the Site and to establish and maintain appropriate administrative, technical, and physical safeguards to protect against such unauthorized use or access (iii) not to violate anyone else\'s rights, including copyright, trademark, trade secret, right of privacy, right of publicity or other rights, (iv) not to upload, post, transmit, distribute or otherwise publish on or to the Site any materials that contain a software virus or other harmful component. You further agree that your use of the Site will, at all times, comply with the IBM Acceptable Use Policy located on the Internet at www.ibm.com/services/e-business/aup.html and any subsequent modification',
            '</p>',
             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Limitations on the Use of Data and Information from the Site',
            '</h4>',

            '<p>',
                'Without the prior written consent of FHCRC, you:',
            '</p>',
            '<p>',
                '(i) will not use information or data from the Site for any purpose other than the design, testing and evaluation of the Site for the Project,<br/>',
                '(ii) will not transfer any information or data from the Site to any other individual or institution;<br/>',
                '(iii) will not publish or present any of data or information obtained from the Site or the results of any use of such data and information; or<br/>',
                '(iv) will not file for intellectual property protection for any invention made as a result from or from your use of the data from the Site.',
            '</p>',
            '<p>',
                'No individual identifiers of vaccine trial participants will be provided to you through the Site.  You agree not be use any information or data from the Site, either alone or in conjunction with any other information to establish the individual identities of any of the vaccine trial participants from whom the data on the Site was obtained. Unless otherwise approved in writing by the data providers, upon the completion of your use of data contained on this Site for the design, testing and/or evaluation of the Site or at the end of the Project, whichever is first, you agree to discontinue use of and destroy any and all data or information obtained from the Site.  You will provide prompt written notice of such destruction to FHCRC.',
            '</p>',

             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
            'Additional Terms and Conditions',
            '</h4>',

            '<p>',
                'If you access the MHRP datasets, you agree to additional terms and conditions.  Review the additional terms and condition for access to the MHRP dataset <a href="">here</a>.',
            '</p>',
            '<p>',
                'If you access the CHAVI datasets, you agree to additional terms and conditions.  Review the additional terms and condition for access to the CHAVI dataset <a href="">here</a>.',
            '</p>',

        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Institutional and IRB Approvals',
            '</h4>',

            '<p>',
                'You represent and warrant (i) that you have obtained all institutional approvals required by the institution by whom you are employed for your use of the Site and data and information from the Site and (ii) that you have obtained approval from your institution’s Institutional Review Board, or equivalent body, for your use of data and information from the Site to the extent required by law and your institution.',
            '</p>',
              
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Disclaimers',
            '</h4>',
            '<p>',
                'THE SITE AND ALL INFORMATION AND DATA FROM THE SITE ARE PROVIDED "AS IS" AND "AS AVAILABLE". FHCRC DOES NOT WARRANT THE ACCURACY, ADEQUACY OR COMPLETENESS OF THIS INFORMATION AND DATA, AND, TO THE EXTENT PERMITTED BY LAW, FHCRC EXPRESSLY DISCLAIMS ALL WARRANTIES OF ANY KIND, IMPLIED, EXPRESSED OR STATUTORY INCLUDING THE WARRANTIES OF NON-INFRINGEMENT OF THIRD PARTY RIGHTS, TITLE, MERCHANTABILITY OR QUALITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF INFORMATION, INFORMATION ACCESS, FREEDOM FROM COMPUTER VIRUS OR OTHER HARMFUL ELEMENTS. THE DISCLAIMERS AND EXCLUSIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC’S SUPPLIERS AND SUBCONTRACTORS, INCLUDING IBM, AS THIRD PARTY BENEFICIARIES.',
            '</p>',
              
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Limited Liability and Remedy',
            '</h4>',
            '<p>',
                'YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE IS AT YOUR OWN RISK.  FHCRC WILL NOT BE LIABLE FOR ANY DAMAGES RELATED TO YOUR USE OF OR INABILITY TO USE THE SITE, INCLUDING WITHOUT LIMITATION, DIRECT, INDIRECT, SPECIAL, COMPENSATORY OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOSS OF OR DAMAGE TO PROPERTY, EVEN IF FHCRC HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.  THE LIMITATIONS IN THIS SECTION ALSO APPLY TO ANY OF FHCRC’S SUPPLIERS AND SUBCONTRACTORS, INCLUDING IBM, AS THIRD PARTY BENEFICIARIES AND YOU ACKNOWLEDGE AND AGREE THAT YOU HAVE NO REMEDY AGAINST SUCH SUPPLIERS OR SUBCONTRACTORS FOR ANY costs or damages YOU INCUR ARISING OUT OF, OR RELATING TO YOUR USE OF THE SITE AND DATA AND INFORMATION FROM THE SITE.',
            '<p>',
             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Modifications to the Site and Terms of Use',
            '</h4>',
            '<p>',
                'FHCRC may at any time modify, replace, refuse access to, suspend or discontinue the Site, partially or entirely, or change and modify all or part of the services for you or for all users in its sole discretion and without notice.',
            '</p>',
            '<p>',
                'FHCRC reserves the right to modify the Terms of Use at any time without notice, but the most current version of the Terms of Use will always be available to you by clicking on the link at the bottom of the Site. If you find the Terms of Use unacceptable at any time, you may discontinue your use of the Site, but the Terms of Use shall survive such discontinuation with respect to activity occurring prior to such discontinuation. By continuing to use the Site after the date of any change of the Terms of Use, including accessing the Site, you agree to be bound by the provisions contained in the most recent version of the Terms of Use.',
            '</p>',
             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Indemnity',
            '</h4>',
            '<p>',
                'You agree to indemnify, defend and hold FHCRC and its officers, directors, owners, agents, employees, affiliates, licensees, licensors suppliers and subcontractors (including IBM) harmless from and against all claims, losses, liability, cost, and expenses (including attorneys\' fees) arising from your violation of these Terms of Use or misuse of this Site, or any service, product, information or data provided through this Site. Your obligations under this Section will survive your termination of access to or use of this Site, or nonuse of any service, information or data.',
            '</p>',
             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Applicable Law',
            '</h4>',
            '<p>',
                'These Terms of Use will be construed according to Washington law, without regard to provisions governing conflicts of laws.  Any dispute arising under or relating to these Terms of Use, the content, the use of the Site, or any services obtained using this Site, will be resolved exclusively by the state and federal courts of the State of Washington.  Your use of the Site constitutes your consent to the jurisdiction and venue of such courts with respect to any such dispute.',
            '</p>',
             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Additional Terms and Conditions for Access to and Use of the MHRP Data Set.',
            '</h4>',
            '<p>',
                'The MHRP data is derived from RV144 study samples which were provided to MHRP under the terms of a material transfer agreement (“MTA”) with the Ministry of Public Health (hereinafter “MOPH”), Thailand, on behalf of the MOPH-TAVEG (Thai AIDS Vaccine Evaluation Group) Collaboration (see the MTA here), and is made available as a service to the research community.',
            '</p>',
            '<p>',
                'In addition to the general terms and conditions for access to Site, you agree that:',
            '</p>',
            '<p>',
                '(i)       you will use the MHRP data solely for the CDS Pilot Project and consistently with the MTA the terms of which may be found here,<br/>',
                '(ii)      you will not disclose the MHRP data or the results from the MHRP data without specific agreement from the MHRP and the MOPH-TAVEG Collaboration,<br/>',
                '(iii)     you will immediately notify MHRP and FHCRC in writing if the MHRP Data or use or the MHRP data results in new inventions intellectual property to permit notification of the U.S. Government of the existence of such new intellectual property, and<br/>',
                '(iv)      you will provide all patent applications to MHRP and notification to FHCRC that you have provided such application to MHRP thirty (30) days prior to submission and public disclosure to allow MHRP to review and seek approval from the MOPH-TAVEG Collaboration.',
            '</p>',
             
        '</section>',
        '<section class="terms-block">',
            '<h4>',
                'Additional Terms and Conditions for Access to and Use of the CHAVI Data Set',
            '</h4>',
            '<p>',
                'In addition to the general terms and conditions for access to Site, you agree that:',
            '</p>',
            '<p>',
                '(i)       you will not disclose the CHAVI data or the results from the CHAVI data without specific agreement with CHAVI,<br/>',
                '(ii)      you will use the CHAVI data solely for developing the database infrastructure in the CDS Pilot Project, and<br/>',
                '(iii)     you will not file patent applications directed to inventions developed from the CHAVI data or results from the CHAVI data',
            '</p>',
        '</section>',
        '</tpl>'),

    initComponent : function() {
        this.data = {};

        this.callParent();
    }
});


