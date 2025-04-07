
import MainLayout from "@/components/layout/MainLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Chat = () => {
  return (
    <MainLayout>
      <div className="container max-w-6xl py-6">
        <div className="bg-background rounded-lg shadow-sm">
          <ChatContainer />
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
