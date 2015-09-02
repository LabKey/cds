function signin() {

    var loginFields = ['email', 'password', 'tos-checkbox'],
            inputs = {},
            allFieldsPresent = true;

    for (var idx in loginFields) {
        var field = loginFields[idx],
                el = document.getElementById(field),
                input = el.type === 'checkbox' ? el.checked : el.value;

        if (input) {
            inputs[field] = input;
        }
        else {
            allFieldsPresent = false;
        }
    }

    if (allFieldsPresent) {
        LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL("login", "loginAPI.api"),
            method: 'POST',
            jsonData: {
                email: inputs['email'],
                password: inputs['password'],
                remember: inputs['remember-me-checkbox'],
                approvedTermsOfUse: inputs['tos-checkbox']
            },
            success: LABKEY.Utils.getCallbackWrapper(function (response) {
                if (response && response.user && response.user.isSignedIn) {
                    LABKEY.user = response.user || LABKEY.user;
                    window.location = LABKEY.ActionURL.buildURL("cds", "app.view");
                }
                else {
                    jQuery('.signin-modal .notifications p').html('Login Failed');
                }
            }),
            failure: LABKEY.Utils.getCallbackWrapper(function () {
                jQuery('.signin-modal .notifications p').html('Login Failed');
            })
        });
    }
    else {
        jQuery('.signin-modal .notifications p').html('Required fields are missing.');
    }
}