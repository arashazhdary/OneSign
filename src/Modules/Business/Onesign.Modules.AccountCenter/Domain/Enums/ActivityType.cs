namespace Onesign.Modules.AccountCenter.Domain.Enums;

public enum ActivityType
{
    Login = 1,
    Logout = 2,
    PasswordChange = 3,
    ProfileUpdate = 4,
    MfaEnabled = 5,
    MfaDisabled = 6,
    ConsentGranted = 7,
    ConsentRevoked = 8,
    DeviceAdded = 9,
    DeviceRemoved = 10
}
