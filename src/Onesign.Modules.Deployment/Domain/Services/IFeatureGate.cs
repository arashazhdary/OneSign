namespace Onesign.Modules.Deployment.Domain.Services;

public interface IFeatureGate
{
    bool IsEnabled(string moduleKey);
}
