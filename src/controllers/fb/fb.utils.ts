import { dbModels } from "../../database/models";
import fbService from "../../services/axios/fb";

async function handleRecievingMessage(message: any) {
  const customerId = message.sender.id,
    pageId = message.recipient.id,
    timestamp = message.timestamp,
    messageBody = message.message.text,
    fbMessageId = message.message.mid;

  const recievedMsg = {
    from: customerId,
    isCustomerMessage: true,
    messageBody: messageBody,
    timestamp: timestamp,
    isFirst: true,
  };

  const currentTime = new Date();
  const timeBefore24Hours = new Date(
    currentTime.getTime() - 24 * 60 * 60 * 1000
  );

  const conversation = await dbModels.Conversation.find({
    customerId,
    pageId,
    lastMessageTimestamp: { $gt: timeBefore24Hours },
  });

  console.log("convvvvv", conversation);

  if (conversation.length == 0) {
    const fbAccount = await dbModels.FbAccount.find({ pageId: pageId });
    let customerDetails = { first_name: "", last_name: "", profile_pic: "" };
    console.log("sender", message.sender.id);
    // try {
    //   customerDetails = await fbService.getCustomer(
    //     customerId,
    //     fbAccount && fbAccount[0] && fbAccount[0].userAccessToken
    //   );
    // } catch (err) {
    //   console.log(err);
    // }
    console.log("acccccc", fbAccount);
    const newConversation = await dbModels.Conversation.create({
      client: fbAccount[0].client,
      pageId,
      customerId,
      messages: [recievedMsg],
      convType: "dm",
      lastMessageTimestamp: timestamp,
      customerName: `${customerDetails?.first_name} ${customerDetails?.last_name}`,
      customerProfilePic: `${customerDetails?.profile_pic}`,
    });
    const newMessenger = await dbModels.Messenger.create({
      client: fbAccount[0].client,
      pageId,
      customerId,
      lastMessage: recievedMsg.messageBody,
      isCustomerMsg: true,
      convType: "dm",
      lastMessageTimestamp: timestamp,
      isRead: false,
      conversation: newConversation._id,
      customerName: `${customerDetails.first_name} ${customerDetails.last_name}`,
      customerProfilePic: `${customerDetails.profile_pic}`,
    });
    return newConversation;
  } else {
    if (
      conversation[0].messages[conversation[0].messages.length - 1]
        .isCustomerMessage == true
    ) {
      recievedMsg.isFirst = false;
    }
    conversation[0].messages.push(recievedMsg);
    conversation[0].lastMessageTimestamp = timestamp;
    await conversation[0].save();
    const messenger = await dbModels.Messenger.find({
      conversation: conversation[0]._id,
    });
    messenger[0].lastMessageTimestamp = timestamp;
    messenger[0].lastMessage = recievedMsg.messageBody;
    messenger[0].isCustomerMsg = true;
    messenger[0].isRead = false;
    messenger[0].save();
    return conversation[0];
  }
}

async function handleSendMessage(
  client: any,
  pageId: any,
  customerId: any,
  message: any
) {
  const timestamp = new Date(Date.now()),
    messageBody = message.text,
    messageId = message.mid;

  const sentMsg = {
    from: pageId,
    isCustomerMessage: false,
    messageBody: messageBody,
    timestamp: timestamp,
    isFirst: true,
  };

  const currentTime = new Date();
  const timeBefore24Hours = new Date(
    currentTime.getTime() - 24 * 60 * 60 * 1000
  );

  const conversation = await dbModels.Conversation.find({
    customerId,
    pageId,
    lastMessageTimestamp: { $gt: timeBefore24Hours },
  });

  if (conversation.length > 0) {
    if (
      conversation[0].messages[conversation[0].messages.length - 1]
        .isCustomerMessage == false
    ) {
      sentMsg.isFirst = false;
    }
    conversation[0].messages.push(sentMsg);
    conversation[0].lastMessageTimestamp = timestamp;
    await conversation[0].save();
    const messenger = await dbModels.Messenger.find({
      conversation: conversation[0]._id,
    });
    messenger[0].lastMessageTimestamp = timestamp;
    messenger[0].lastMessage = sentMsg.messageBody;
    messenger[0].isCustomerMsg = true;
    messenger[0].isRead = true;
    messenger[0].save();
    return conversation[0];
  } else {
    return undefined;
  }
}

export { handleRecievingMessage, handleSendMessage };
