import { SamplesManager } from "@/components/SamplesManager";
import { listSamples } from "@/lib/store";

export default async function SamplesPage() {
  return <SamplesManager samples={await listSamples()} />;
}
