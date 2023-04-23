export const isValidEmail = (stringEmail) => (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(stringEmail))
export const isValidPassword = (stringPassword) => stringPassword.length >= 5
