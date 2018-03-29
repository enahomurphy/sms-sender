const isString = (val) => val && val.length > 1  || false
const isPhone = (val) => val &&
  !isNaN(val) &&
  val.toString().length > 6 ||
  false

const form = document.querySelector('form');

// disables all input
const disableInputs = (state = true) => {
  Array.prototype.forEach.call(
    form.querySelectorAll(
      "input, textarea, button"
    ),
    input => {
      if (state) return input.setAttribute('disabled', state)
      input.removeAttribute('disabled', state)
    }
  );
}
// clears all input
const clearInputs = (state = true) => {
  Array.prototype.forEach.call(
    form.querySelectorAll(
      "input, textarea, button"
    ),
    input => input.value = ''
  );
}

// gets form input by name
const getFormInput = (name) => {
  // get input out text element
  return form.querySelector(`input[name='${name}']`) ||
    form.querySelector(`textarea[name='${name}']`)
}

// display form errors
const showError = (name, message) => {
  input = getFormInput(name)
  input.setAttribute('class', 'form-error')

  // only create element if one does not exist
  const prevError = input.previousElementSibling
  if (!prevError) {
    const span = document.createElement('span')
    span.innerHTML = message
    span.setAttribute('class', 'error')
    input.parentNode.insertBefore(span, input)
  }
}

// clears error message from input field 
const clearError = (name) => {
  const input = getFormInput(name)
  input.setAttribute('class', '')
  const prevError = input.previousElementSibling
  if (prevError) {
    input.parentNode.removeChild(prevError);
  }
}

// updates the submit form when sending sms
// shows a loading icon
const sending = (state = true) => {
  button = form.querySelector('button')
  if (!state) {
    return button.innerHTML = 'send'
  }
  const img = document.createElement('img')
  img.setAttribute('src', '/img/loading.gif')
  img.setAttribute('alt', 'loading')
  img.setAttribute('class', 'loading')
  button.innerHTML = ''
  button.appendChild(img)
}

// shows server generated message
const showMessage = (message, type) => {
  const messageElem = document.getElementById('message')
  messageElem.setAttribute('class', `message-${type}`)
  messageElem.innerHTML = message

  setTimeout(() => {
    messageElem.innerHTML = ''
  }, 5000)
}

// handles sending request to the server
const sendMessage = async (body) => {
  const headers = new Headers({
    'Content-Type': 'application/json'
  })
  sending()  
  const response = await fetch('/api/v1/send', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  })

  const data = await response.json()

  if (response.status === 422) {
    data.errors.forEach((error) => {
      showError(error.path, error.message)
    })
  }
  else if (response.status === 500) {
    showMessage(data.message, 'failure')
  } else if (response.status === 200) {
    showMessage(data.message, 'success')
    clearInputs()
  }

  sending(false)
  disableInputs(false)
}

// handles the form submit event
form.addEventListener('submit', (event) => {
  event.preventDefault()
  const body = {}
  let errorCount = 0;
  form.querySelectorAll('input, textarea')
    .forEach((elem) => {
      const value = elem.value
      const name = elem.getAttribute('name')
      if (name === 'phone' && !isPhone(value)) {
        showError(name, 'number must be greater than 6 starting with the country code')
        errorCount++
      }
      else if (['message', 'name'].includes(name) && !isString(value)) {
        showError(name, `A valid ${name} is required`)
        errorCount++
      }
      else {
        clearError(name)
        body[name] = value
      }
    })

  if(!errorCount) {
    disableInputs()
    sendMessage(body)
  }
})
