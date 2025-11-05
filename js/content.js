/**
 * SmartWrite AI - Content Script v2.0
 * AI-powered email generation with context-awareness and smart suggestions
 * Enhanced with history, keyboard shortcuts, and intelligent features
 */

// State management
let emailHistory = [];
let currentEmailContext = null;

// Detect email compose fields and extract context from thread
function detectEmailFieldsWithContext() {
  const emailFields = {
    subject: null,
    body: null,
    context: null,
    replyingTo: null
  };

  // Gmail selectors
  const gmailSubject = document.querySelector('input[name="subjectbox"]');
  const gmailBody = document.querySelector('div[aria-label="Message Body"]') || 
                    document.querySelector('div[role="textbox"][aria-label*="Message"]');
  
  // Extract Gmail conversation context
  const gmailThread = document.querySelector('.nH.if');
  if (gmailThread) {
    const messages = gmailThread.querySelectorAll('.h7, .adn');
    if (messages.length > 0) {
      // Get the last message (the one being replied to)
      const lastMessage = messages[messages.length - 1];
      emailFields.replyingTo = lastMessage.innerText.substring(0, 500); // Limit context
    }
  }
  
  // Outlook selectors
  const outlookSubject = document.querySelector('input[aria-label*="Subject"]') ||
                         document.querySelector('input[placeholder*="Subject"]');
  const outlookBody = document.querySelector('div[aria-label*="Message body"]') ||
                      document.querySelector('div[role="textbox"][aria-label*="body"]');
  
  // Yahoo selectors
  const yahooSubject = document.querySelector('input[data-test-id="compose-subject"]');
  const yahooBody = document.querySelector('div[data-test-id="compose-message-body"]');
  
  // Generic selectors (works for most email services)
  const genericSubject = document.querySelector('input[name*="subject" i]') ||
                         document.querySelector('input[id*="subject" i]') ||
                         document.querySelector('input[placeholder*="subject" i]');
  const genericBody = document.querySelector('textarea[name*="body" i]') ||
                      document.querySelector('textarea[name*="message" i]') ||
                      document.querySelector('div[contenteditable="true"]') ||
                      document.querySelector('iframe[title*="message" i]');

  emailFields.subject = gmailSubject || outlookSubject || yahooSubject || genericSubject;
  emailFields.body = gmailBody || outlookBody || yahooBody || genericBody;

  return emailFields;
}

// Create enhanced floating AI button with keyboard shortcut
function createAIButton() {
  // Remove existing button if any
  const existingBtn = document.getElementById("smartwrite-btn");
  if (existingBtn) existingBtn.remove();

  const button = document.createElement("button");
  button.innerText = "✨ Lamp";
  button.id = "smartwrite-btn";
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    z-index: 999999;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  
  button.addEventListener("mouseenter", () => {
    button.style.transform = "translateY(-2px)";
    button.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.6)";
  });
  
  button.addEventListener("mouseleave", () => {
    button.style.transform = "translateY(0)";
    button.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.4)";
  });

  document.body.appendChild(button);
  button.addEventListener("click", showEnhancedModal);
}

// Enhanced modal with smart suggestions, context awareness, and history
async function showEnhancedModal() {
  const existingModal = document.getElementById("smartwrite-modal");
  if (existingModal) existingModal.remove();

  // Extract email context
  const emailContext = detectEmailFieldsWithContext();
  currentEmailContext = emailContext.replyingTo;

  const modal = document.createElement("div");
  modal.id = "smartwrite-modal";
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 1000000;
    width: 500px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  `;

  let smartSuggestionsHTML = '';
  
  // Generate smart suggestions if we have context
  if (currentEmailContext) {
    smartSuggestionsHTML = `
      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; font-weight: 600;">🎯 SMART SUGGESTIONS (One-Click):</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="quick-suggestion" data-intent="Accept and confirm">✅ Accept & Confirm</button>
          <button class="quick-suggestion" data-intent="Politely decline">🙏 Politely Decline</button>
          <button class="quick-suggestion" data-intent="Request more information">ℹ️ Need More Info</button>
          <button class="quick-suggestion" data-intent="Schedule a follow-up">📅 Schedule Follow-up</button>
        </div>
      </div>
      <div style="margin: 15px 0; text-align: center; color: #999; font-size: 12px;">
        <span style="display: inline-block; width: 40%; height: 1px; background: #ddd; vertical-align: middle;"></span>
        <span style="padding: 0 10px;">OR</span>
        <span style="display: inline-block; width: 40%; height: 1px; background: #ddd; vertical-align: middle;"></span>
      </div>
    `;
  }

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <h3 style="margin: 0; color: #333; font-size: 18px;">✨ MailGenie</h3>
      <button id="smartwrite-history" style="padding: 6px 12px; background: #f0f0f0; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">📚 History</button>
    </div>
    
    ${currentEmailContext ? `
      <div style="margin-bottom: 12px; padding: 10px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 5px;">
        <p style="margin: 0; font-size: 11px; color: #065f46; font-weight: 600;">📧 REPLYING TO:</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #333; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
          ${currentEmailContext.substring(0, 150)}...
        </p>
      </div>
    ` : ''}
    
    ${smartSuggestionsHTML}
    
    <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">Type intention or paste draft - AI will perfect it:</p>
    <textarea id="smartwrite-input" placeholder="e.g., 'Accept meeting tomorrow' OR paste your draft here..." 
      style="width: 100%; height: 100px; padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif;"></textarea>
    
    <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: center;">
      <div>
        <label style="font-size: 12px; color: #555; display: block; margin-bottom: 4px;">Tone:</label>
        <select id="smartwrite-tone" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 5px; font-size: 13px;">
          <option value="professional" selected>Professional</option>
          <option value="casual">Casual</option>
          <option value="formal">Formal</option>
          <option value="friendly">Friendly</option>
          <option value="concise">Concise</option>
        </select>
      </div>
      
      <div>
        <label style="font-size: 12px; color: #555; display: block; margin-bottom: 4px;">Length:</label>
        <select id="smartwrite-length" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 5px; font-size: 13px;">
          <option value="short">Short</option>
          <option value="medium" selected>Medium</option>
          <option value="long">Detailed</option>
        </select>
      </div>
    </div>
    
    <div style="margin-top: 15px; display: flex; gap: 10px;">
      <button id="smartwrite-generate" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;">
        ✨ Generate Perfect Email
      </button>
      <button id="smartwrite-cancel" style="padding: 12px 16px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Cancel</button>
    </div>
    <div id="smartwrite-status" style="margin-top: 10px; text-align: center; color: #059669; font-size: 13px;"></div>
    
    ${emailHistory.length > 0 ? `
      <div id="smartwrite-history-panel" style="display: none; margin-top: 15px; padding: 12px; background: #f8f9fa; border-radius: 8px; max-height: 150px; overflow-y: auto;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; font-weight: 600;">Recent Generations:</p>
        ${emailHistory.slice(-5).reverse().map((item, idx) => `
          <div class="history-item" data-index="${idx}" style="padding: 8px; background: white; border-radius: 5px; margin-bottom: 5px; cursor: pointer; font-size: 12px; border: 1px solid #ddd;">
            <strong>${item.subject}</strong><br>
            <span style="color: #666; font-size: 11px;">${item.body.substring(0, 50)}...</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // Add styles for quick suggestions
  const style = document.createElement('style');
  style.textContent = `
    .quick-suggestion {
      padding: 8px 14px;
      background: white;
      border: 2px solid #10b981;
      color: #059669;
      border-radius: 20px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .quick-suggestion:hover {
      background: #10b981;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
    }
    .history-item:hover {
      background: #f0fdf4 !important;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);

  const backdrop = document.createElement("div");
  backdrop.id = "smartwrite-backdrop";
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(modal);

  // Event listeners
  document.getElementById("smartwrite-generate").addEventListener("click", () => handleEnhancedGenerate());
  document.getElementById("smartwrite-cancel").addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  
  const historyBtn = document.getElementById("smartwrite-history");
  if (historyBtn) {
    historyBtn.addEventListener("click", toggleHistory);
  }
  
  // Quick suggestion buttons
  document.querySelectorAll('.quick-suggestion').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const intent = e.target.getAttribute('data-intent');
      document.getElementById('smartwrite-input').value = intent;
      handleEnhancedGenerate();
    });
  });
  
  // History item clicks
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-index'));
      const historyItem = emailHistory[emailHistory.length - 1 - idx];
      const fields = detectEmailFieldsWithContext();
      if (fields.subject && historyItem.subject) {
        fillField(fields.subject, historyItem.subject);
      }
      if (fields.body && historyItem.body) {
        fillField(fields.body, historyItem.body);
      }
      closeModal();
    });
  });
  
  const textarea = document.getElementById("smartwrite-input");
  textarea.focus();
}

function toggleHistory() {
  const panel = document.getElementById('smartwrite-history-panel');
  if (panel) {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}

function closeModal() {
  const modal = document.getElementById("smartwrite-modal");
  const backdrop = document.getElementById("smartwrite-backdrop");
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
}

// Detect if text is in Bangla (বাংলা script) or Banglish (Bengali in English script)
function detectBanglaOrBanglish(text) {
  // Check for Bangla Unicode characters (U+0980 to U+09FF)
  const hasBanglaScript = /[\u0980-\u09FF]/.test(text);
  
  if (hasBanglaScript) {
    return true; // Definitely Bangla
  }
  
  // Check for common Banglish words and patterns
  const banglishKeywords = [
    // Pronouns
    'ami', 'amra', 'tumi', 'apni', 'apnara', 'tara', 'se', 'tar',
    // Common verbs
    'korbo', 'korchi', 'korechi', 'korte', 'kora', 'hobe', 'hoyeche', 'hocche',
    'chai', 'cheyechi', 'parbo', 'pari', 'partam', 'parlam',
    'jabo', 'jete', 'giyechi', 'asbo', 'aste', 'esechi',
    'debo', 'dite', 'diyechi', 'nibo', 'nite', 'niyechi',
    'dekhechi', 'dekhbo', 'shunechi', 'shunbo', 'bolechi', 'bolbo',
    'likhbo', 'likhechi', 'porbo', 'porechi', 'jani', 'janto', 'janai',
    // Greetings & common phrases
    'kemon', 'achen', 'acho', 'assalamu', 'alaikum', 'salam', 'nomoshkar',
    'dhonnobad', 'shukriya', 'doya', 'kore', 'kindly', 'daya',
    // Question words
    'ki', 'keno', 'kivabe', 'kothay', 'kokhon', 'kar', 'kake', 'kader',
    // Adjectives & adverbs
    'bhalo', 'valo', 'kharap', 'sundor', 'shundor', 'khub', 'onek', 'ektu', 'boro', 'choto',
    // Time & conjunctions
    'aaj', 'kal', 'parso', 'agamikal', 'gotokal', 'ekhon', 'tokhon',
    'tahole', 'tobe', 'kintu', 'ebong', 'ar', 'ba', 'othoba',
    // Common words
    'eta', 'ota', 'sheta', 'ekhane', 'okhane', 'shekhane',
    'amar', 'tomar', 'apnar', 'tader', 'amader',
    'email', 'emailta', 'bishoye', 'bishoy', 'meeting', 'meetingta',
    'kaj', 'kaaj', 'kaje', 'office', 'officeta',
    // Bengali phonetic variations
    'ache', 'achhi', 'chhilo', 'chilo', 'thakbo', 'thakbe',
    'dekha', 'shob', 'sob', 'moto', 'mone', 'hoy', 'hoye'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Count how many Banglish keywords are present
  let matchCount = 0;
  for (const keyword of banglishKeywords) {
    // Use word boundary to avoid partial matches
    const regex = new RegExp('\\b' + keyword + '\\b', 'i');
    if (regex.test(lowerText)) {
      matchCount++;
    }
  }
  
  // If 2 or more Banglish keywords found, consider it Banglish
  if (matchCount >= 2) {
    return true;
  }
  
  // Check for common Banglish sentence patterns
  const banglishPatterns = [
    /\bami\s+\w+\s+(korbo|chai|parbo|jabo)\b/i,
    /\btumi\s+\w+\s+(korbe|korcho|parbe)\b/i,
    /\bapni\s+\w+\s+(korben|korchen|parben)\b/i,
    /\b(kemon|kivabe)\s+achen\b/i,
    /\bdhonnobad\s+(janai|janachchhi)\b/i
  ];
  
  for (const pattern of banglishPatterns) {
    if (pattern.test(lowerText)) {
      return true;
    }
  }
  
  return false; // Default to English
}

// Enhanced generate with retry logic and better error handling
async function handleEnhancedGenerate(retryCount = 0) {
  const inputText = document.getElementById("smartwrite-input").value.trim();
  if (!inputText) {
    alert("Please enter your message intention or draft!");
    return;
  }

  const toneSelect = document.getElementById("smartwrite-tone");
  const lengthSelect = document.getElementById("smartwrite-length");
  
  const tone = toneSelect ? toneSelect.value : 'professional';
  const length = lengthSelect ? lengthSelect.value : 'medium';
  
  // Auto-detect Bangla or Banglish
  const useBangla = detectBanglaOrBanglish(inputText);

  const statusDiv = document.getElementById("smartwrite-status");
  const generateBtn = document.getElementById("smartwrite-generate");
  
  generateBtn.disabled = true;
  generateBtn.innerHTML = useBangla ? "✨ তৈরি হচ্ছে..." : "✨ Creating Perfect Email...";
  statusDiv.innerHTML = `<span style="display: inline-block; animation: pulse 1.5s infinite;">🤖</span> ${useBangla ? "AI আপনার ইমেইল তৈরি করছে..." : "AI is crafting your email..."}`;

  try {
    // Smart detection: Is it an intention or a draft?
    const isDraft = inputText.split(' ').length > 15 || inputText.includes('\n');
    
    let result;
    if (isDraft) {
      result = await smartImproveEmail(inputText, useBangla, tone, length, currentEmailContext);
    } else {
      result = await generateEmailContent(inputText, useBangla, tone, length, currentEmailContext);
    }
    
    // Save to history
    emailHistory.push({
      subject: result.subject,
      body: result.body,
      timestamp: Date.now()
    });
    
    // Keep only last 20
    if (emailHistory.length > 20) {
      emailHistory = emailHistory.slice(-20);
    }
    
    // Save to storage
    chrome.storage.local.set({ emailHistory });
    
    // Detect email fields
    const fields = detectEmailFieldsWithContext();
    
    if (!fields.subject && !fields.body) {
      alert("⚠️ No email compose fields detected. Please open an email compose window first.");
      generateBtn.disabled = false;
      generateBtn.innerHTML = "✨ Generate Perfect Email";
      return;
    }

    // Fill in the fields with smooth animation
    if (fields.subject && result.subject) {
      await fillFieldAnimated(fields.subject, result.subject);
      statusDiv.innerText = useBangla ? "✅ বিষয় পূরণ হয়েছে!" : "✅ Subject filled!";
    }
    
    if (fields.body && result.body) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await fillFieldAnimated(fields.body, result.body);
      statusDiv.innerHTML = `✅ ${useBangla ? "ইমেইল সফলভাবে তৈরি হয়েছে!" : "Email generated successfully!"} <br><span style="font-size: 11px; color: #666;">Closing in 2 seconds...</span>`;
      setTimeout(closeModal, 2000);
    }

  } catch (error) {
    // Handle extension context invalidated error
    if (error.message.includes('Extension context invalidated')) {
      statusDiv.innerHTML = `🔄 Extension was updated!<br><span style="font-size: 11px;">Please <strong>refresh this page (F5)</strong> to continue.</span>`;
      statusDiv.style.color = "#ff9800";
      generateBtn.disabled = false;
      generateBtn.innerHTML = "✨ Refresh Page First";
      return;
    }
    
    // Retry logic for network errors
    if (retryCount < 2 && (error.message.includes('network') || error.message.includes('Failed to fetch'))) {
      statusDiv.innerHTML = `⚠️ Network issue. Retrying... (${retryCount + 1}/2)`;
      setTimeout(() => handleEnhancedGenerate(retryCount + 1), 2000);
      return;
    }
    
    // Handle API errors
    if (error.message.includes('API key')) {
      statusDiv.innerHTML = `❌ ${error.message}<br><span style="font-size: 11px;">Open extension popup and add your API key in Settings.</span>`;
      statusDiv.style.color = "#dc3545";
    } else {
      statusDiv.innerHTML = `❌ Error: ${error.message}<br><span style="font-size: 11px;">Try again or check your internet connection.</span>`;
      statusDiv.style.color = "#dc3545";
    }
    
    generateBtn.disabled = false;
    generateBtn.innerHTML = "✨ Try Again";
  }
}

// Animated field filling (types out the text for better UX)
async function fillFieldAnimated(element, text, speed = 10) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.value = '';
    for (let i = 0; i < text.length; i++) {
      element.value += text[i];
      element.dispatchEvent(new Event('input', { bubbles: true }));
      if (i % 5 === 0) { // Only delay every 5 characters for faster animation
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
    element.innerHTML = text.replace(/\n/g, '<br>');
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  element.focus();
}

function fillField(element, text) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
    element.innerHTML = text.replace(/\n/g, '<br>');
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  // Trigger focus to ensure the change is registered
  element.focus();
  element.blur();
  element.focus();
}

// Generate email content using AI with enhanced prompting and context awareness
async function generateEmailContent(intention, useBangla = false, tone = 'professional', length = 'medium', context = null) {
  const apiKey = await getApiKey();
  
  const languageInstruction = useBangla
    ? "Write in Bangla (বাংলা ভাষায়). Use natural, conversational Bangla that sounds human. If the user wrote in Banglish (Bengali words in English letters), convert it to proper Bangla script (বাংলা লিপি)."
    : "Write in English. Use natural, conversational language that sounds genuinely human-written, not AI-generated.";
  
  const lengthGuide = {
    short: "Keep it brief and to the point (2-3 sentences max).",
    medium: "Write a well-balanced email (4-6 sentences).",
    long: "Provide detailed, comprehensive content (7-10 sentences with rich context)."
  };
  
  const contextInstruction = context 
    ? `\n\nYou are replying to this email:\n---\n${context}\n---\nMake your response relevant to the above context.`
    : '';
  
  const prompt = `You are an expert email writer who creates emails that sound completely human and natural.

${languageInstruction}
Tone: ${tone}
Length: ${lengthGuide[length]}
${contextInstruction}

User's intention: "${intention}"

Write a complete email that:
- Sounds genuinely human (use contractions, varied sentence length, natural flow)
- Has warmth and personality
- Is contextually appropriate
- Never sounds robotic or templated
- Includes appropriate greeting and professional closing

IMPORTANT: The subject line should be in the SAME language as the email body. If body is in Bangla, subject must also be in Bangla.

Format EXACTLY as:
SUBJECT: [compelling subject line in appropriate language, max 60 chars]
BODY: [natural, human-sounding email body]`;

  const data = await callGeminiAPI(apiKey, prompt, 0.9);
  return parseEmailResponse(data);
}

// Smart improve function that refines drafts with context awareness
async function smartImproveEmail(draft, useBangla = false, tone = 'professional', length = 'medium', context = null) {
  const apiKey = await getApiKey();
  
  const languageInstruction = useBangla
    ? "Improve in Bangla (বাংলা ভাষায়). Keep it natural and human-sounding. If the draft is in Banglish (Bengali words in English letters), convert it to proper Bangla script (বাংলা লিপি)."
    : "Improve in English. Make it sound naturally human-written, never robotic.";
  
  const lengthGuide = {
    short: "Make it concise and brief.",
    medium: "Keep a balanced, natural length.",
    long: "Expand thoughtfully with relevant detail."
  };
  
  const contextInstruction = context 
    ? `\n\nContext: This is a reply to:\n---\n${context}\n---\nEnsure the improved version is relevant to this context.`
    : '';
  
  const prompt = `You are an expert email editor. Transform this draft into a polished, human-sounding email.

${languageInstruction}
Tone: ${tone}
${lengthGuide[length]}
${contextInstruction}

Draft: "${draft}"

Improve by:
- Fixing grammar, spelling, and clarity
- Making it sound genuinely human (not AI-generated)
- Adding natural flow and personality
- Adjusting tone appropriately
- Adding proper greeting/closing if missing
- Creating a clear, engaging subject line

IMPORTANT: The subject line should be in the SAME language as the email body. If body is in Bangla, subject must also be in Bangla.

Format EXACTLY as:
SUBJECT: [improved subject line in appropriate language]
BODY: [improved email body]`;

  const data = await callGeminiAPI(apiKey, prompt, 0.75);
  return parseEmailResponse(data);
}

// Helper: Call Gemini API with better configuration
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
          topK: 40,
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
    throw new Error("API key not configured. Please go to extension settings.");
  }
  return result.geminiApiKey;
}

// Initialize the extension when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

async function initExtension() {
  try {
    // Load email history from storage
    const stored = await chrome.storage.local.get(['emailHistory']);
    if (stored.emailHistory) {
      emailHistory = stored.emailHistory;
    }
    
    createAIButton();
    
    // Re-create button if page content changes (for SPAs like Gmail)
    const observer = new MutationObserver(() => {
      if (!document.getElementById("smartwrite-btn")) {
        createAIButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    // Silent fail - extension still works without history
    console.log('SmartWrite AI: Initialization error (non-critical)', error);
  }
}
