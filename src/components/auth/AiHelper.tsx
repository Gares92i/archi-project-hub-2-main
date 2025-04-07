
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AiHelperProps {
  activeTab: string;
}

const AiHelper = ({ activeTab }: AiHelperProps) => {
  const [aiHelp, setAiHelp] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const askAiHelper = async () => {
    setIsAiLoading(true);
    setAiHelp('');
    try {
      const { data, error } = await supabase.functions.invoke('ai-auth-helper', {
        body: JSON.stringify({
          query: activeTab === 'login' 
            ? 'Provide tips for a secure login process' 
            : 'Provide guidance for creating a strong account'
        })
      });

      if (error) throw error;
      setAiHelp(data.response);
    } catch (error) {
      console.error('AI Helper Error:', error);
      setAiHelp('Sorry, the AI helper is temporarily unavailable.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={askAiHelper}
        disabled={isAiLoading}
        className="text-primary"
      >
        <Sparkles className="h-5 w-5" />
      </Button>
      
      {aiHelp && (
        <div className="bg-primary/10 text-primary p-3 rounded-md mb-4 text-sm">
          {aiHelp}
        </div>
      )}
    </>
  );
};

export default AiHelper;
