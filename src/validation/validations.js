const validateEmail = (email) => {
    return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email);
  };
  
  
  const validatePassword = (password) => {
    //8-15 characters, one lowercase letter and one number and maybe one UpperCase & special character:
    return /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,15}$/.test(password);
  };
  const validateMobileNo = (Number) => {
    return /^[6789][0-9]{9}$/g.test(Number);
  };
  module.exports = {
    validateEmail,
    validatePassword,
    validateMobileNo
  };  