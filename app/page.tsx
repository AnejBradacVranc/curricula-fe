import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-primary">
        Curricula
      </h1>
      <p className="mt-2 text-2xl text-muted-foreground">
        Aplikacija za beleženje ur učiteljev
      </p>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Upravljajte šole, učitelje, predmete in urnike na enem mestu. Za
        dostop do nadzorne plošče se prijavite v svoj račun.
      </p>
      <div className="mt-8 flex gap-3">
        <Button render={<Link href="/login" />}>Prijava</Button>
        <Button render={<Link href="/dashboard" />} variant="outline">
          Nadzorna plošča
        </Button>
      </div>
    </div>
  );
}
