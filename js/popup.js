/**
 * SmartWrite AI - Popup Script
 * Extension popup interface and settings management
 */

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  // Setup tab switching
  setupTabs();
  
  // Check API key and load settings
  const result = await chrome.storage.local.get(['geminiApiKey']);
  if (!result.geminiApiKey) {
    switchToTab('settingsTab');
  }
  
  // Load API key into settings if exists
  if (result.geminiApiKey) {
    const apiKeyInput = document.getElementById("apiKeyInput");
    if (apiKeyInput) {
      apiKeyInput.value = result.geminiApiKey;
    }
  }
});

// Setup tab switching functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchToTab(tabId);
    });
  });
}

// Switch between tabs
function switchToTab(tabId) {
  // Update button states
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    }
  });
  
  // Update content visibility
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    content.style.display = 'none';
  });
  
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.style.display = 'block';
  }
}

// Save API key handler
document.getElementById("saveApiBtn").addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKeyInput").value.trim();
  const statusDiv = document.getElementById("apiStatus");
  
  if (!apiKey) {
    statusDiv.style.display = "block";
    statusDiv.className = "api-status error";
    statusDiv.textContent = "Please enter an API key";
    return;
  }
  
  try {
    await chrome.storage.local.set({ geminiApiKey: apiKey });
    statusDiv.style.display = "block";
    statusDiv.className = "api-status success";
    statusDiv.textContent = "✓ API key saved successfully!";
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.style.display = "none";
      switchToTab('generateTab');
    }, 1500);
  } catch (error) {
    statusDiv.style.display = "block";
    statusDiv.className = "api-status error";
    statusDiv.textContent = "Failed to save API key";
  }
});

// Unified Smart Email Generation button handler
document.getElementById("generateBtn").addEventListener("click", async () => {
  const inputText = document.getElementById("inputText").value.trim();
  const useBangla = document.getElementById("banglaCheckbox").checked;
  const tone = document.getElementById("toneSelector").value;
  const length = document.getElementById("lengthSelector").value;
  const generateBtn = document.getElementById("generateBtn");
  const outputSection = document.getElementById("output-section");

  if (!inputText) {
    alert("Please enter your email intention or draft!");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = useBangla ? "✨ তৈরি হচ্ছে..." : "✨ Creating Perfect Email...";
  outputSection.style.display = "none";

  try {
    // Smart detection: Is it an intention or a draft?
    const isDraft = inputText.split(' ').length > 15 || inputText.includes('\n');
    
    let result;
    if (isDraft) {
      // It's a draft - improve it
      result = await smartImproveEmail(inputText, useBangla, tone, length);
    } else {
      // It's an intention - generate from scratch
      result = await generateEmailContent(inputText, useBangla, tone, length);
    }
    
    document.getElementById("subjectOutput").value = result.subject;
    document.getElementById("outputText").value = result.body;
    outputSection.style.display = "block";
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = "✨ Generate Perfect Email";
  }
});

// Regenerate button handler
document.getElementById("regenerateBtn").addEventListener("click", () => {
  document.getElementById("generateBtn").click();
});

// Insert email handler
document.getElementById("insertBtn").addEventListener("click", async () => {
  const subject = document.getElementById("subjectOutput").value;
  const body = document.getElementById("outputText").value;
  await insertIntoEmail(subject, body);
});

// Insert email into compose window
async function insertIntoEmail(subject, body) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillEmailFields,
      args: [subject, body]
    });
    window.close();
  } catch (error) {
    alert("Failed to insert email. Make sure you're on an email page with compose window open.");
  }
}

// Generate email content using AI with enhanced prompting
async function generateEmailContent(intention, useBangla = false, tone = 'professional', length = 'medium') {
  const apiKey = await getApiKey();
  
  const languageInstruction = useBangla 
    ? "Write in Bangla (বাংলা ভাষায়). Use natural, conversational Bangla that sounds human."
    : "Write in English. Use natural, conversational language that sounds genuinely human-written.";
  
  const lengthGuide = {
    short: "Keep it brief and to the point (2-3 sentences max).",
    medium: "Write a well-balanced email (4-6 sentences).",
    long: "Provide detailed, comprehensive content (7-10 sentences)."
  };
  
  const prompt = `You are an expert email writer. Create emails that sound completely human and natural, never robotic or AI-generated.

${languageInstruction}
Tone: ${tone}
Length: ${lengthGuide[length]}

User's intention: "${intention}"

Write a complete, polished email with:
- A clear, compelling subject line (max 60 chars)
- A natural-sounding body with proper greeting and closing
- Vary sentence structure for natural flow
- Use contractions where appropriate (I'm, don't, etc.)
- Sound warm and authentic

Format EXACTLY as:
SUBJECT: [subject line]
BODY: [email body]`;

  const data = await callGeminiAPI(apiKey, prompt, 0.9);
  return parseEmailResponse(data);
}

// Smart improve function that refines drafts
async function smartImproveEmail(draft, useBangla = false, tone = 'professional', length = 'medium') {
  const apiKey = await getApiKey();
  
  const languageInstruction = useBangla 
    ? "Improve in Bangla (বাংলা ভাষায়). Keep it natural and human-sounding."
    : "Improve in English. Make it sound naturally human-written, not AI-generated.";
  
  const lengthGuide = {
    short: "Make it concise and brief.",
    medium: "Keep a balanced length.",
    long: "Expand with more detail and context."
  };
  
  const prompt = `You are an expert email editor. Transform this draft into a perfect, human-sounding email.

${languageInstruction}
Tone: ${tone}
${lengthGuide[length]}

Draft: "${draft}"

Improve this by:
- Fixing grammar, spelling, and clarity
- Making it sound natural and human (not robotic)
- Adjusting the tone appropriately
- Adding proper greeting/closing if missing
- Extracting or creating a great subject line

Format EXACTLY as:
SUBJECT: [improved subject line]
BODY: [improved email body]`;

  const data = await callGeminiAPI(apiKey, prompt, 0.75);
  return parseEmailResponse(data);
}

// Helper: Call Gemini API
async function callGeminiAPI(apiKey, prompt, temperature = 0.8) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: temperature,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    }
  );

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || "API request failed");
  }
  
  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("No response from AI. Check your API key.");
  }
  
  return data;
}

// Helper: Parse email response
function parseEmailResponse(data) {
  const fullText = data.candidates[0].content.parts[0].text;
  
  let subject = "";
  let body = "";
  
  const subjectMatch = fullText.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = fullText.match(/BODY:\s*([\s\S]+?)$/i);
  
  if (subjectMatch && bodyMatch) {
    subject = subjectMatch[1].trim();
    body = bodyMatch[1].trim();
  } else {
    const lines = fullText.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      subject = lines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
      body = lines.slice(1).join('\n').trim();
    } else {
      subject = "Email";
      body = fullText.trim();
    }
  }
  
  // Clean up: Remove any remaining SUBJECT: or BODY: labels
  subject = subject.replace(/^SUBJECT:\s*/i, '').trim();
  body = body.replace(/^BODY:\s*/i, '').trim();
  
  // Limit subject line length
  if (subject.length > 80) {
    subject = subject.substring(0, 77) + '...';
  }

  return { subject, body };
}

// Helper: Get API key
async function getApiKey() {
  const result = await chrome.storage.local.get(['geminiApiKey']);
  if (!result.geminiApiKey) {
    throw new Error("API key not configured. Please go to Settings tab.");
  }
  return result.geminiApiKey;
}

// Fill email fields function (runs in page context)
function fillEmailFields(subject, body) {
  const selectors = {
    gmail: {
      subject: "input[name='subjectbox']",
      body: "div[aria-label='Message Body']",
    },
    outlook: {
      subject: "input[aria-label='Subject']",
      body: "div[aria-label='Message body']",
    },
    yahoo: {
      subject: "input[data-test-id='compose-subject']",
      body: "div[data-test-id='rte']",
    },
  };

  let filled = false;
  for (const client in selectors) {
    const subjectField = document.querySelector(selectors[client].subject);
    const bodyField = document.querySelector(selectors[client].body);

    if (bodyField) {
      if (subjectField && subject) {
        subjectField.value = subject;
        subjectField.dispatchEvent(new Event('input', { bubbles: true }));
      }
      bodyField.innerHTML = body.replace(/\n/g, '<br>');
      bodyField.dispatchEvent(new Event('input', { bubbles: true }));
      bodyField.focus();
      filled = true;
      break;
    }
  }

  if (!filled) {
    const genericBody = document.querySelector('div[contenteditable="true"], textarea');
    if (genericBody) {
      if (genericBody.tagName === 'TEXTAREA') {
        genericBody.value = body;
      } else {
        genericBody.innerHTML = body.replace(/\n/g, '<br>');
      }
      genericBody.dispatchEvent(new Event('input', { bubbles: true }));
      genericBody.focus();
    } else {
      alert("⚠️ Could not find email compose fields. Make sure compose window is open.");
    }
  }
}
