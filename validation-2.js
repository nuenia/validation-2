var $ = document.querySelector.bind(document)

function Validator(formSelector) {
    var _this = this
    var formRules = {} //Object rỗng để chứa các rules

    function getParents(element,selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = parentElement
        }
    }

    /**Quy ước
     * -Nếu có lỗi thì return 'error message'
     * -Nếu ko có lỗi thì return undefinded
     */
    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập đầy đủ'
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`
            }
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`
            }
        },
    }

    var formElement = $(formSelector) //lấy ra trong DOM element tổng

    if(formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]') // lấy ra các element có 2 atribute là name và rules

        //vì inputs là nodelist giống 1 phần với Array có thể dùng for of để lặp 
        for(let input of inputs) {
            formRules[input.name] = input.getAttribute('rules')//Gáng name của input là key của obj(formRules) và value là attribute rules của key đó

            //tách | giữa các rules
            var rules = input.getAttribute('rules').split('|')

            for(var rule of rules) {

                var ruleInfo;
                var ruleHasValue = rule.includes(':')

                if(ruleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]
                }
                // console.log(rule)

                var ruleFunc = validatorRules[rule]

                if(ruleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }

            // lắng nghe sự kiện để validate
            input.onblur = handleValidate
            input.oninput = handleClearError
        }
        //Hàm thực hiện validate
        function handleValidate(event) {
            var rules = formRules[event.target.name]
            var errorMessage

            for(var rule of rules) {
                errorMessage = rule(event.target.value)
                if(errorMessage) break
            }
            
            if(errorMessage) {
                var formGroup = getParents(event.target, '.form-group')
                if(formGroup) {
                    formGroup.classList.add('invalid')
                    var formMessage = formGroup.querySelector('.form-message')
                    if(formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
                
            }
            return !errorMessage
        }

        //hàm clear message lỗi
        function handleClearError(event) {
            var formGroup = getParents(event.target, '.form-group')
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')
            }
            var formMessage = formGroup.querySelector('.form-message')
                if(formMessage) {
                    formMessage.innerText = ''
                }
        }

        // console.log(formRules)
    }
    //xử lý hành vi submit form
    formElement.onsubmit = function(event) {
        event.preventDefault()

        var inputs = formElement.querySelectorAll('[name][rules]')
        var isValid = true

        for(var input of inputs) {
            if(!handleValidate({ target : input})) {
                isValid = false
            }
        }
        if(isValid) {
            if(typeof _this.onSubmit === 'function') {

                var enableInputs = formElement.querySelectorAll('[name]')
            
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio' :
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }

                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})

                _this.onSubmit(formValues)
            } else {
                formElement.submit()
            }
        }
    }

}