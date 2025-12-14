const form = document.getElementById('prescriptionForm');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const prescriptionOutput = document.getElementById('prescriptionOutput');

// Google Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyDCRmHvPqbt3avQxGLKJZiWXqKJZiWXqKJ';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        patientName: document.getElementById('patientName').value,
        patientAge: document.getElementById('patientAge').value,
        patientGender: document.getElementById('patientGender').value,
        patientWeight: document.getElementById('patientWeight').value,
        doctorName: document.getElementById('doctorName').value,
        doctorSpecialization: document.getElementById('doctorSpecialization').value,
        symptoms: document.getElementById('symptoms').value,
        allergies: document.getElementById('allergies').value,
        currentMedications: document.getElementById('currentMedications').value
    };

    // Show loading
    form.style.display = 'none';
    loadingSection.style.display = 'block';
    resultSection.classList.remove('active');

    try {
        // Call Google Gemini AI API
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an expert medical AI assistant specialized in generating professional medical prescriptions. Generate a detailed, professional medical prescription based on the following patient information:

Patient Name: ${formData.patientName}
Age: ${formData.patientAge} years
Gender: ${formData.patientGender}
Weight: ${formData.patientWeight ? formData.patientWeight + ' kg' : 'Not provided'}
Symptoms & Diagnosis: ${formData.symptoms}
Known Allergies: ${formData.allergies || 'None reported'}
Current Medications: ${formData.currentMedications || 'None'}

Doctor: ${formData.doctorName}
Specialization: ${formData.doctorSpecialization}

Please provide a comprehensive prescription in the following structured format:

**DIAGNOSIS:**
Provide a clear diagnosis based on the symptoms described.

**PRESCRIBED MEDICATIONS:**
List 3-5 appropriate medications with complete details:

1. [Medicine Name]
   - Dosage: [specific dosage]
   - Frequency: [e.g., twice daily, three times daily]
   - Duration: [e.g., 7 days, 14 days]
   - Instructions: [e.g., after meals, before bedtime]
   - Purpose: [why this medication]

2. [Continue for each medication...]

**ADDITIONAL INSTRUCTIONS:**
- Lifestyle recommendations
- Dietary advice
- Activity restrictions or recommendations
- Precautions to take

**FOLLOW-UP:**
Specify when the patient should return for follow-up consultation.

**WARNINGS & SIDE EFFECTS:**
List any important warnings or potential side effects to watch for.

Make it professional, medically accurate, and easy to understand. Consider the patient's age, weight, gender, and any allergies mentioned. Ensure all recommendations are safe and appropriate for the patient's condition.`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            displayPrescription(formData, aiResponse);
        } else {
            throw new Error('Invalid AI response format');
        }

    } catch (error) {
        console.error('Error:', error);
        loadingSection.style.display = 'none';
        form.style.display = 'block';
        
        const errorHtml = `
            <div class="error-message">
                <h3>⚠️ Error Generating Prescription</h3>
                <p>${error.message}</p>
                <p>Please check your internet connection and try again. If the problem persists, the AI service may be temporarily unavailable.</p>
            </div>
        `;
        
        prescriptionOutput.innerHTML = errorHtml;
        resultSection.classList.add('active');
    }
});

function displayPrescription(formData, aiResponse) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Format the AI response with better styling
    const formattedResponse = aiResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    const html = `
        <div class="prescription-header">
            <h2>📋 Medical Prescription</h2>
            <p><strong>Date:</strong> ${currentDate} | <strong>Time:</strong> ${currentTime}</p>
            <p><strong>Prescription ID:</strong> RX-${Date.now()}</p>
        </div>

        <div class="prescription-section">
            <h3>👤 Patient Information</h3>
            <p><strong>Name:</strong> ${formData.patientName}</p>
            <p><strong>Age:</strong> ${formData.patientAge} years | <strong>Gender:</strong> ${formData.patientGender}</p>
            ${formData.patientWeight ? `<p><strong>Weight:</strong> ${formData.patientWeight} kg</p>` : ''}
            ${formData.allergies ? `<p><strong>⚠️ Allergies:</strong> <span style="color: #c33; font-weight: 600;">${formData.allergies}</span></p>` : ''}
            ${formData.currentMedications ? `<p><strong>Current Medications:</strong> ${formData.currentMedications}</p>` : ''}
        </div>

        <div class="prescription-section">
            <h3>👨‍⚕️ Doctor Information</h3>
            <p><strong>Name:</strong> ${formData.doctorName}</p>
            <p><strong>Specialization:</strong> ${formData.doctorSpecialization}</p>
        </div>

        <div class="prescription-section">
            <h3>🤖 AI-Generated Medical Prescription</h3>
            <div style="line-height: 1.8; color: #333;">
                <p>${formattedResponse}</p>
            </div>
        </div>

        <div class="prescription-section" style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="font-size: 0.85em; color: #666; line-height: 1.6;">
                <strong>⚠️ Important Disclaimer:</strong> This prescription was generated using advanced AI technology (Google Gemini) 
                and is intended for informational and educational purposes only. It should be reviewed and validated by a licensed 
                medical professional before use. This does not replace professional medical advice, diagnosis, or treatment. 
                Always consult with a qualified healthcare provider for medical decisions.
            </p>
        </div>

        <div class="prescription-section" style="text-align: center; margin-top: 30px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
            <p style="margin: 0; font-size: 0.9em;">
                <strong>Powered by MediScript AI</strong> | Advanced Medical AI Assistant
            </p>
        </div>
    `;

    prescriptionOutput.innerHTML = html;
    loadingSection.style.display = 'none';
    resultSection.classList.add('active');
    
    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadPrescription() {
    window.print();
}

function printPrescription() {
    window.print();
}

function resetForm() {
    form.reset();
    form.style.display = 'block';
    resultSection.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}