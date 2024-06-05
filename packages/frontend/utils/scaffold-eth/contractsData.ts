import scaffoldConfig from "~~/scaffold.config";
import { contracts } from "~~/utils/scaffold-eth/contract";

export function getAllContracts() {

  // const contractsData = contracts?.[scaffoldConfig.targetNetworks[0].id];

  // TODO: hardcoding the target network to 1 for now
  // to avoid missing contracts for Debug page. This happens
  // since we made Base Sepolia default

  const contractsData = contracts?.[scaffoldConfig.targetNetworks[1].id];
  return contractsData ? contractsData : {};
}
