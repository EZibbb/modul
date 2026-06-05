import { ThemeToggle } from "./_ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const swatches = [
  { name: "primary", cls: "bg-primary", fg: "text-primary-foreground" },
  { name: "cyan", cls: "bg-cyan", fg: "text-white" },
  { name: "success", cls: "bg-success", fg: "text-white" },
  { name: "warning", cls: "bg-warning", fg: "text-white" },
  { name: "destructive", cls: "bg-destructive", fg: "text-destructive-foreground" },
  { name: "info", cls: "bg-info", fg: "text-white" },
];

export default function Home() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-4 px-6">
          <span className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Modul<span className="font-normal text-muted-foreground">&nbsp;comp</span>
            </span>
            <span className="mono text-2xs rounded bg-muted px-1.5 py-0.5 text-muted-foreground">shadcn</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm">ИИ-консультант</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>ИИ-со-пилот</SheetTitle>
                  <SheetDescription>
                    Боковая панель инженерного со-пилота. Заглушка примитива Sheet на наших токенах.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <Card>
                    <CardHeader>
                      <span className="mono text-sm text-primary">MC-SFP10G-LR</span>
                      <CardAction>
                        <Badge>подобрано ИИ</Badge>
                      </CardAction>
                      <CardTitle className="text-base">SFP+ 10GBASE-LR</CardTitle>
                      <CardDescription>1310 нм · 10 км · LC · DOM</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] space-y-12 px-6 py-12">
        <section>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="mono">850 · 1310 · 1550 NM</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Инженерная точность как интерфейс
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Фундамент: дизайн-токены (light/dark), Inter + IBM&nbsp;Plex&nbsp;Mono, и примитивы
            shadcn/ui на наших токенах. Артикул: <span className="mono text-primary">MC-SFP10G-LR</span>.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Бренд и семантика</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {swatches.map((c) => (
              <div key={c.name} className={`flex h-20 items-end rounded-lg p-3 shadow-sm ${c.cls} ${c.fg}`}>
                <span className="mono text-2xs">{c.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Кнопки и бейджи</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>В корзину</Button>
            <Button variant="secondary">В сравнение</Button>
            <Button variant="outline">Документация</Button>
            <Button variant="ghost">Подробнее</Button>
            <Button variant="destructive">Снять с производства</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge>в наличии</Badge>
            <Badge variant="secondary">под заказ</Badge>
            <Badge variant="outline">протестировано</Badge>
            <Badge variant="destructive">EOL</Badge>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Карточка · табы · модалка</h2>
          <Card className="max-w-md">
            <CardHeader>
              <span className="mono text-sm text-primary">MC-QSFP100G-LR4</span>
              <CardAction>
                <Badge variant="outline" className="border-success/40 text-success">в наличии</Badge>
              </CardAction>
              <CardTitle>QSFP28 100GBASE-LR4</CardTitle>
              <CardDescription>CWDM4 · 1310 нм · 10 км · LC · DOM</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="specs">
                <TabsList>
                  <TabsTrigger value="specs">Характеристики</TabsTrigger>
                  <TabsTrigger value="compat">Совместимость</TabsTrigger>
                  <TabsTrigger value="dom">DOM</TabsTrigger>
                </TabsList>
                <TabsContent value="specs" className="mono text-sm text-muted-foreground">
                  100GBASE-LR4 · 4×25G · DFB · −8…−1 dBm Tx · −10.6 dBm Rx
                </TabsContent>
                <TabsContent value="compat" className="text-sm text-muted-foreground">
                  Cisco Nexus 9300 · Juniper QFX5200 · Arista 7050X
                </TabsContent>
                <TabsContent value="dom" className="text-sm text-muted-foreground">
                  Температура, напряжение, ток, Tx/Rx Power — в норме.
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-between border-t border-border">
              <span className="mono text-lg font-semibold">22&nbsp;500&nbsp;₽</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Запросить КП</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Запрос коммерческого предложения</DialogTitle>
                    <DialogDescription>
                      Заглушка примитива Dialog на токенах. Здесь будет форма КП.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Отмена</Button>
                    <Button>Отправить</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
}
