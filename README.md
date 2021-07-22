SQS Receive Message Proof of Concept
====================================

This PoC aims to solve the limitation of SQS to return the exactly amount of messages the user wants.

From AWS SQS docs:

> Short poll is the default behavior where a weighted random set of machines is sampled on a ReceiveMessage call. Thus, only the messages on the sampled machines are returned. **If the number of messages in the queue is small (fewer than 1,000), you most likely get fewer messages than you requested per ReceiveMessage call**. If the number of messages in the queue is extremely small, you might not receive any messages in a particular ReceiveMessage response. **If this happens, repeat the request**.
