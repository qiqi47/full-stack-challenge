import { ScrollArea } from '@radix-ui/react-scroll-area';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const chatbox = ({ messages, input, handleInputChange, handleSubmit }: any) => {
    return (
        <div className="flex flex-col h-full">
            <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Trading Assistant</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-center p-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                I can help you to check the stock price for you, and add it to
                                your watch list. You can ask "check stock price for AMZN" or
                                "add AMZN to watch list"
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((message: any) => (
                    <div key={message.id} className="mb-4">
                        <div className="flex items-start gap-3">
                            <Avatar
                                className={message.role === 'user' ? 'bg-primary' : 'bg-muted'}
                            >
                                <AvatarFallback>
                                    {message.role === 'user' ? 'U' : 'AI'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <div className="font-semibold">
                                    {message.role === 'user' ? 'You' : 'AI'}
                                </div>
                                <div className="text-sm">{message.content}</div>
                            </div>
                        </div>

                        {message.toolInvocations?.map((toolInvocation: any) => {
                            const { toolName, toolCallId, state } = toolInvocation;
                            if (state === 'result' && toolName === 'getStockInfo') {
                                const { result } = toolInvocation;
                                return (
                                    <div key={toolCallId} className="mt-4 ml-10">
                                        <Card className="p-3">
                                            <div className="text-sm">
                                                <div className="font-semibold">
                                                    {result.symbol}
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Price:</span>
                                                    <span className="font-medium">
                                                        ${result.price}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Change:</span>
                                                    <span
                                                        className={
                                                            Number(result.change) >= 0
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }
                                                    >
                                                        {Number(result.change) >= 0 ? '+' : ''}
                                                        {result.change}%
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                ))}
            </ScrollArea>

            <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask about stocks..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default chatbox;
