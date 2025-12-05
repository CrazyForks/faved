import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useContext, useRef, useState } from 'react';
import { StoreContext } from '@/store/storeContext';
import { Loader2Icon } from 'lucide-react';
import {
  IconBrandChrome,
  IconBrandEdge,
  IconBrandFirefox,
  IconBrandPocket,
  IconBrandSafari,
} from '@tabler/icons-react';

export const SettingsImport = ({ onSuccess }: { onSuccess?: () => void }) => {
  const store = useContext(StoreContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pocket' | 'browser'>('browser');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
  };

  const submitPocket = async () => {
    const success = await store.importPocketBookmarks(selectedFile, setIsLoading);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const submitBrowser = async () => {
    const success = await store.importBrowserBookmarks(selectedFile, setIsLoading);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const resetFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'pocket' | 'browser');
    resetFile();
  };

  return (
    <Card className="touch-pan-y">
      <CardHeader>
        <CardTitle className="text-lg">Import Bookmarks</CardTitle>
        <CardDescription>Import your bookmarks to Faved.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="h-auto w-full items-stretch">
            <TabsTrigger value="browser" className="flex flex-wrap">
              <div className="inline-flex items-center gap-0.5">
                <IconBrandChrome className="h-4 w-4" />
              </div>
              <span>From browser</span>
            </TabsTrigger>
            <TabsTrigger value="pocket" className="flex flex-wrap">
              <IconBrandPocket className="h-4 w-4" />
              <span>From Pocket</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pocket" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="pocket-zip">Pocket ZIP Archive</Label>
              <Input
                id="pocket-zip"
                accept=".zip"
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <p className="text-muted-foreground text-sm">Select the ZIP file you exported from Pocket.</p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <span className="text-xs font-semibold text-white">i</span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight dark:text-blue-200">What will be imported:</h3>
              </div>
              <ul className="mt-3 ml-4 list-disc space-y-2 text-sm">
                <li>All Pocket bookmarks, tags, collections and notes.</li>
                <li>Unread and Archived bookmarks will be assigned corresponding tags under "Status" parent tag.</li>
                <li>All imported bookmarks will have "Imported from Pocket" tag.</li>
                <li>Collections will be imported as tags under "Collections" parent tag.</li>
                <li>Collection descriptions will be preserved as tag descriptions.</li>
                <li>Collection bookmark notes will be saved as item comments.</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="browser" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="bookmarks-html">Bookmarks HTML File</Label>
              <Input
                id="bookmarks-html"
                accept=".html,.htm"
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                disabled={isLoading}
              />
              <p className="text-muted-foreground text-sm">Select your exported bookmarks file in HTML format.</p>
              <p className="text-muted-foreground text-sm">
                Exports from <IconBrandChrome className="ml-1 inline h-4 w-4 align-text-top" /> Chrome,
                <IconBrandFirefox className="ml-1 inline h-4 w-4 align-text-top" /> Firefox,
                <IconBrandSafari className="ml-1 inline h-4 w-4 align-text-top" /> Safari,
                <IconBrandEdge className="ml-1 inline h-4 w-4 align-text-top" /> Edge, and most other browsers are
                supported.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <span className="text-xs font-semibold text-white">i</span>
                </div>
                <h3 className="text-lg font-semibold tracking-tight dark:text-blue-200">What will be imported:</h3>
              </div>
              <ul className="mt-3 ml-4 list-disc space-y-2 text-sm">
                <li>All browser bookmarks and folders.</li>
                <li>Bookmark folders will be converted to tags.</li>
                <li>Folder hierarchy will be preserved. Nested folders will become nested tags.</li>
                <li>All bookmarks will have "Imported from browser" tag.</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={activeTab === 'pocket' ? submitPocket : submitBrowser}
          disabled={!selectedFile || isLoading}
          type="submit"
        >
          {isLoading && <Loader2Icon className="mr-2 animate-spin" />}
          Import {activeTab === 'pocket' ? 'Pocket' : 'Browser'} Bookmarks
        </Button>
      </CardFooter>
    </Card>
  );
};
