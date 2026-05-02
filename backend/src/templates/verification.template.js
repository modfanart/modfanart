export const verificationTemplate = (name, url) => {
  return `
  <div style="margin:0;padding:0;background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <table width="100%" max-width="600" cellpadding="0" cellspacing="0" 
            style="background:#ffffff;border-radius:12px;padding:40px;font-family:Arial, sans-serif;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h2 style="margin:0;color:#1e1e1e;">
                  Welcome, ${name} 👋
                </h2>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td align="center" style="padding:10px 0;color:#555;font-size:14px;">
                Please verify your account to get started.
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding:30px 0;">
                <a href="${url}"
                  style="
                    background-color:#9747ff;
                    color:#ffffff;
                    padding:12px 24px;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:600;
                    display:inline-block;
                  ">
                  Verify Account
                </a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="border-top:1px solid #eee;padding-top:20px;"></td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="font-size:12px;color:#9d9d9d;">
                If you didn’t request this, you can safely ignore this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `;
};
