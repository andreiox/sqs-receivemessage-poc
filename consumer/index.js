const AWS = require("aws-sdk");
const dotenv = require("dotenv");

const queues = require("./queues.json");

dotenv.config();

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const baseURL = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT}/`;

const receiveMessages = async (queueName, batchsize) => {
  const params = {
    QueueUrl: `${baseURL}${queueName}`,
    MaxNumberOfMessages: batchsize > 10 ? 10 : batchsize,
  };

  return sqs.receiveMessage(params).promise();
};

const deleteMessages = async (queueName, messages) => {
  const entries = messages.map((message) => {
    return { Id: message.MessageId, ReceiptHandle: message.ReceiptHandle };
  });

  const params = {
    QueueUrl: `${baseURL}${queueName}`,
    Entries: entries,
  };

  return sqs.deleteMessageBatch(params).promise();
};

const processMessages = async (queueName, messages) => {
  console.log(`processing ${messages.length} messages from ${queueName}`);
  messages.forEach((message) => console.log(message.Body));
};

const pollMessages = async (queueName, batchsize, emptyCount = 0) => {
  const data = await receiveMessages(queueName, batchsize);
  if (!data.Messages) {
    if (emptyCount > 0) return;
    else return pollMessages(queueName, batchsize, ++emptyCount);
  }

  await processMessages(queueName, data.Messages);

  deleteMessages(queueName, data.Messages);

  if (data.Messages.length < batchsize) {
    pollMessages(queueName, batchsize - data.Messages.length);
  }
};

const main = async () => {
  const promises = [];
  for (const queue of queues) {
    promises.push(pollMessages(queue.name, queue.batchsize));
  }

  await Promise.all(promises);
};

main();
