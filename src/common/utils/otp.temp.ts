export const otpTemplate = ({
  otp,
  username,
  title
}: {
  otp: number;
  username: string;
  title: string;
}) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial">
  <h2>${title}</h2>
  <p>${username} your verification code is:</p>

  <h1
    style="
      letter-spacing:8px;
      color:#007bff;
    "
  >
    ${otp}
  </h1>

  <p>This code expires in 10 minutes.</p>

</body>
</html>
`;