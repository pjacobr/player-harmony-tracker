import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameScreenshotProps {
  url: string;
}

export function GameScreenshot({ url }: GameScreenshotProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="rounded-lg overflow-hidden max-w-2xl mx-auto cursor-pointer transition-transform hover:scale-[1.02]">
          <img
            src={url}
            alt="Game Screenshot"
            className="w-full h-auto object-cover"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-fit p-0 bg-transparent border-0">
        <img
          src={url}
          alt="Game Screenshot"
          className="w-auto max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}