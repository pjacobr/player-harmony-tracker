import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export const TabNavigation = ({ activeTab, onTabChange }: {
  activeTab: string;
  onTabChange: (value: string) => void;
}) => {
  const isMobile = useIsMobile();

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-5'} bg-gaming-card`}>
        <TabsTrigger value="players" className="text-sm">
          Players
        </TabsTrigger>
        <TabsTrigger value="analytics" className="text-sm">
          Analytics
        </TabsTrigger>
        {!isMobile && (
          <>
            <TabsTrigger value="teams" className="text-sm">
              Teams
            </TabsTrigger>
            <TabsTrigger value="screenshots" className="text-sm">
              Screenshots
            </TabsTrigger>
            <TabsTrigger value="game-logs" className="text-sm">
              Game Logs
            </TabsTrigger>
          </>
        )}
      </TabsList>
      {isMobile && (
        <TabsList className="grid w-full grid-cols-3 gap-2 mt-2 bg-gaming-card">
          <TabsTrigger value="teams" className="text-sm">
            Teams
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="text-sm">
            Screenshots
          </TabsTrigger>
          <TabsTrigger value="game-logs" className="text-sm">
            Game Logs
          </TabsTrigger>
        </TabsList>
      )}
    </Tabs>
  );
};