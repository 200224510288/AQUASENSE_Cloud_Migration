import { NextResponse } from "next/server";
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const REGION = "ap-south-1";

const DYNAMODB_TABLE = "aquasense-live-telemetry";
const SQS_QUEUE_URL =
  "https://sqs.ap-south-1.amazonaws.com/108782055227/aquasense-critical-alert-queue";
const SNS_TOPIC_ARN =
  "arn:aws:sns:ap-south-1:108782055227:aquasense-incident-alerts";

const dynamodb = new DynamoDBClient({ region: REGION });
const sqs = new SQSClient({ region: REGION });
const sns = new SNSClient({ region: REGION });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const receivedAt = new Date().toISOString();
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24 hours TTL

    const telemetry = {
      ...body,
      receivedAt,
    };

    await dynamodb.send(
      new PutItemCommand({
        TableName: DYNAMODB_TABLE,
        Item: {
          meter_id: { S: String(body.meter_id ?? "UNKNOWN") },
          timestamp: { S: String(body.timestamp ?? receivedAt) },
          pressure_psi: { N: String(body.pressure_psi ?? 0) },
          flow_lpm: { N: String(body.flow_lpm ?? 0) },
          edge_gateway: { S: String(body.edge_gateway ?? "UNKNOWN") },
          status: { S: String(body.status ?? "normal") },
          alerts: { S: JSON.stringify(body.alerts ?? []) },
          received_at: { S: receivedAt },
          expires_at: { N: String(expiresAt) },
        },
      })
    );

    if (body.status === "alert" && Array.isArray(body.alerts) && body.alerts.length > 0) {
      const alertMessage = JSON.stringify(telemetry);

      await sqs.send(
        new SendMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: alertMessage,
        })
      );

      await sns.send(
        new PublishCommand({
          TopicArn: SNS_TOPIC_ARN,
          Subject: "AquaSense Critical Edge Alert",
          Message: alertMessage,
        })
      );
    }

    console.log("EDGE TELEMETRY STORED:", telemetry);

    return NextResponse.json({
      success: true,
      message: "Edge telemetry stored in DynamoDB",
      data: telemetry,
    });
  } catch (error) {
    console.error("EDGE TELEMETRY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process edge telemetry",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: DYNAMODB_TABLE,
        Limit: 10,
      })
    );

    const items =
      result.Items?.map((item) => ({
        meter_id: item.meter_id?.S,
        timestamp: item.timestamp?.S,
        pressure_psi: Number(item.pressure_psi?.N ?? 0),
        flow_lpm: Number(item.flow_lpm?.N ?? 0),
        edge_gateway: item.edge_gateway?.S,
        status: item.status?.S,
        alerts: item.alerts?.S ? JSON.parse(item.alerts.S) : [],
        receivedAt: item.received_at?.S,
      })) ?? [];

    const latest = items.sort(
      (a, b) =>
        new Date(b.receivedAt ?? b.timestamp ?? 0).getTime() -
        new Date(a.receivedAt ?? a.timestamp ?? 0).getTime()
    )[0];

    return NextResponse.json({
      success: true,
      data: latest ?? null,
      recentItems: items,
    });
  } catch (error) {
    console.error("EDGE TELEMETRY GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch edge telemetry",
        error: String(error),
      },
      { status: 500 }
    );
  }
}