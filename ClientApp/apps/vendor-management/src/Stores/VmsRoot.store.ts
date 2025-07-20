import { VendorManagementStore } from './VendorManagement.store';
import { VendorLocationStore } from './VendorLocation.store';
import { SettingsStore } from './Settings.store';
import { ServiceItemPricingStore } from './ServiceItemPricing.store';
import { ContactMasterStore } from './ContactMaster.store';
import { DocumentUploadStore } from './DocumentUpload.store';
import { UltimateOwnershipStore } from './UltimateOwnership.store';
import { VendorUserStore } from './VendorUser.store';
import { ApprovalsStore } from './Approvals.store';
import { BankInformationStore } from './BankInformation.store';
import { OperationalInsightsStore } from './OperationalInsights.store';
import { OrderSoftwareStore } from './OrderSoftware.store';
import { ApprovalChangesStore } from './ApprovalChanges.store';
import { DirectoryCodeStore } from './DirectoryCode.store';
import { LocationOnBoardingApprovalStore } from './LocationOnBoardingApprovals.store';
import { BulletinStore } from '@wings/shared';
import { VendorLocationPhotoStore } from './VendorLocationPhoto.store';
import { SlidesApprovalStore } from './SlidesApproval.store';

class VMSRootStore {
  public vendorManagementStore: VendorManagementStore = new VendorManagementStore();
  public vendorLocationStore: VendorLocationStore = new VendorLocationStore();
  public settingsStore: SettingsStore = new SettingsStore();
  public serviceItemPricingStore: ServiceItemPricingStore = new ServiceItemPricingStore();
  public contactMasterStore: ContactMasterStore = new ContactMasterStore();
  public documentUploadStore: DocumentUploadStore = new DocumentUploadStore();
  public ultimateOwnershipStore: UltimateOwnershipStore = new UltimateOwnershipStore();
  public vendorUserStore: VendorUserStore = new VendorUserStore();
  public approvalsStore: ApprovalsStore = new ApprovalsStore();
  public bankInformationStore: BankInformationStore = new BankInformationStore();
  public operationalInsightsStore: OperationalInsightsStore = new OperationalInsightsStore();
  public orderSoftwareStore: OrderSoftwareStore = new OrderSoftwareStore();
  public approvalChangesStore: ApprovalChangesStore = new ApprovalChangesStore();
  public directoryCodeStore: DirectoryCodeStore = new DirectoryCodeStore();
  public locationOnBoardingApprovalStore: LocationOnBoardingApprovalStore = new LocationOnBoardingApprovalStore();
  public bulletinStore: BulletinStore = new BulletinStore();
  public vendorLocationPhotoStore: VendorLocationPhotoStore = new VendorLocationPhotoStore();
  public slidesApprovalStore: SlidesApprovalStore = new SlidesApprovalStore();
}

const rootStore = new VMSRootStore();

export default rootStore;
