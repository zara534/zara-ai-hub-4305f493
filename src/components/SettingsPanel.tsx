import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Palette, Type, Moon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function SettingsPanel() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 px-2 md:px-4 pb-6">
      {/* Appearance Settings Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl">Appearance Settings</CardTitle>
          <CardDescription className="text-sm">Customize your ZARA AI HUB experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 md:space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm md:text-base">
              <Type className="w-4 h-4" />
              Font Family
            </Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => updateSettings({ fontFamily: value })}
            >
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="poppins">Poppins</SelectItem>
                <SelectItem value="playfair">Playfair Display</SelectItem>
                <SelectItem value="mono">JetBrains Mono</SelectItem>
                <SelectItem value="lato">Lato</SelectItem>
                <SelectItem value="opensans">Open Sans</SelectItem>
                <SelectItem value="raleway">Raleway</SelectItem>
                <SelectItem value="montserrat">Montserrat</SelectItem>
                <SelectItem value="nunito">Nunito</SelectItem>
                <SelectItem value="merriweather">Merriweather</SelectItem>
                <SelectItem value="ubuntu">Ubuntu</SelectItem>
                <SelectItem value="pacifico">Pacifico</SelectItem>
                <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                <SelectItem value="oswald">Oswald</SelectItem>
                <SelectItem value="quicksand">Quicksand</SelectItem>
                <SelectItem value="archivo">Archivo</SelectItem>
                <SelectItem value="spacegrotesk">Space Grotesk</SelectItem>
                <SelectItem value="crimson">Crimson Text</SelectItem>
                <SelectItem value="comicsans">Comic Sans (Fun!)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm md:text-base">
              <Palette className="w-4 h-4" />
              Color Theme
            </Label>
            <Select
              value={settings.colorTheme}
              onValueChange={(value) => updateSettings({ colorTheme: value })}
            >
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Purple)</SelectItem>
                <SelectItem value="purple">Royal Purple</SelectItem>
                <SelectItem value="blue">Ocean Blue</SelectItem>
                <SelectItem value="green">Forest Green</SelectItem>
                <SelectItem value="orange">Sunset Orange</SelectItem>
                <SelectItem value="red">Ruby Red</SelectItem>
                <SelectItem value="pink">Rose Pink</SelectItem>
                <SelectItem value="cyan">Aqua Cyan</SelectItem>
                <SelectItem value="indigo">Deep Indigo</SelectItem>
                <SelectItem value="teal">Tropical Teal</SelectItem>
                <SelectItem value="yellow">Sunshine Yellow</SelectItem>
                <SelectItem value="violet">Vivid Violet</SelectItem>
                <SelectItem value="lime">Electric Lime</SelectItem>
                <SelectItem value="fuchsia">Vibrant Fuchsia</SelectItem>
                <SelectItem value="amber">Warm Amber</SelectItem>
                <SelectItem value="emerald">Rich Emerald</SelectItem>
                <SelectItem value="sky">Sky Blue</SelectItem>
                <SelectItem value="slate">Slate Gray</SelectItem>
                <SelectItem value="rose">Romantic Rose</SelectItem>
                <SelectItem value="mint">Cool Mint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label className="flex items-center gap-2 text-sm md:text-base">
              <Moon className="w-4 h-4" />
              Dark Mode
            </Label>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
