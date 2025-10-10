'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PersonalInfoPage() {
  const router = useRouter()
  const [age, setAge] = useState<number>(18)
  const [gender, setGender] = useState('')
  const [nationality, setNationality] = useState('')
  const [currentCountry, setCurrentCountry] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFinishUp = async () => {
    setError('')
    if (!gender || !nationality || !currentCountry || !Number.isFinite(age) || age < 13) {
      setError('Please fill in all fields and ensure age is 13 or older')
      return
    }

    setLoading(true)
    try {
      // Create or update personal info
      const response = await fetch('/api/user/personal-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age, gender, nationality, country: currentCountry })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data?.message || 'Failed to save personal information')
        setLoading(false)
        return
      }

      router.push('/home')
    } catch (err: unknown) {
      // Prefer a safe message and log the actual error for debugging
      console.error('Personal info save error', err)
      setError('Failed to save personal information')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/signup')
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-gray-100">
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-lg">
        <h1 className="mb-8 text-3xl font-medium text-center text-gray-800">Personal Information</h1>

        <div className="space-y-5">

          {/* Age Field */}
          <div>
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              min={13}
              step={1}
              className="w-full p-3 text-sm transition-colors border border-l-4 border-gray-300 rounded border-l-purple-600 bg-gray-50/50 focus:outline-none focus:border-l-purple-700"
            />
          </div>

          {/* Gender Dropdown */}
          <div>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 text-sm text-gray-600 transition-colors border border-l-4 border-gray-300 rounded cursor-pointer border-l-purple-600 bg-gray-50/50 focus:outline-none focus:border-l-purple-700"
            >
              <option value="">Select Your Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Nationality (free-text) */}
          <div>
            <textarea
              placeholder="Nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              rows={2}
              className="w-full p-3 text-sm text-gray-600 transition-colors border border-l-4 border-gray-300 rounded resize-none border-l-purple-600 bg-gray-50/50 focus:outline-none focus:border-l-purple-700"
            />
          </div>

          {/* Current Country Dropdown */}
          <div>
            <select
              value={currentCountry}
              onChange={(e) => setCurrentCountry(e.target.value)}
              className="w-full p-3 text-sm text-gray-600 transition-colors border border-l-4 border-gray-300 rounded cursor-pointer border-l-purple-600 bg-gray-50/50 focus:outline-none focus:border-l-purple-700"
            >
              <option value="">Current Country</option>
              <option value="Afghanistan">Afghanistan</option>
              <option value="Albania">Albania</option>
              <option value="Algeria">Algeria</option>
              <option value="Andorra">Andorra</option>
              <option value="Angola">Angola</option>
              <option value="Antigua and Barbuda">Antigua and Barbuda</option>
              <option value="Argentina">Argentina</option>
              <option value="Armenia">Armenia</option>
              <option value="Australia">Australia</option>
              <option value="Austria">Austria</option>
              <option value="Azerbaijan">Azerbaijan</option>
              <option value="Bahamas">Bahamas</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Barbados">Barbados</option>
              <option value="Belarus">Belarus</option>
              <option value="Belgium">Belgium</option>
              <option value="Belize">Belize</option>
              <option value="Benin">Benin</option>
              <option value="Bhutan">Bhutan</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
              <option value="Botswana">Botswana</option>
              <option value="Brazil">Brazil</option>
              <option value="Brunei">Brunei</option>
              <option value="Bulgaria">Bulgaria</option>
              <option value="Burkina Faso">Burkina Faso</option>
              <option value="Burundi">Burundi</option>
              <option value="Cambodia">Cambodia</option>
              <option value="Cameroon">Cameroon</option>
              <option value="Canada">Canada</option>
              <option value="Cape Verde">Cape Verde</option>
              <option value="Central African Republic">Central African Republic</option>
              <option value="Chad">Chad</option>
              <option value="Chile">Chile</option>
              <option value="China">China</option>
              <option value="Colombia">Colombia</option>
              <option value="Comoros">Comoros</option>
              <option value="Congo">Congo</option>
              <option value="Costa Rica">Costa Rica</option>
              <option value="Croatia">Croatia</option>
              <option value="Cuba">Cuba</option>
              <option value="Cyprus">Cyprus</option>
              <option value="Czech Republic">Czech Republic</option>
              <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
              <option value="Denmark">Denmark</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                    <option value="Laos">Laos</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libya">Libya</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malta">Malta</option>
                    <option value="Marshall Islands">Marshall Islands</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Micronesia">Micronesia</option>
                    <option value="Moldova">Moldova</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolia">Mongolia</option>
                    <option value="Montenegro">Montenegro</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="North Korea">North Korea</option>
                    <option value="North Macedonia">North Macedonia</option>
                    <option value="Norway">Norway</option>
                    <option value="Oman">Oman</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palau">Palau</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Peru">Peru</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                    <option value="Saint Lucia">Saint Lucia</option>
                    <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                    <option value="Samoa">Samoa</option>
                    <option value="San Marino">San Marino</option>
                    <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Serbia">Serbia</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="Solomon Islands">Solomon Islands</option>
                    <option value="Somalia">Somalia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Korea">South Korea</option>
                    <option value="South Sudan">South Sudan</option>
                    <option value="Spain">Spain</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Syria">Syria</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Tajikistan">Tajikistan</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Turkmenistan">Turkmenistan</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican City">Vatican City</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Yemen">Yemen</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2 mt-5 text-sm text-center text-red-500 rounded bg-red-50">
                  {error}
                </div>
              )}

              {/* Button Group */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className="flex-1 p-3 text-sm font-semibold text-blue-500 transition-colors bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50"
                >
                  BACK
                </button>
                <button
                  onClick={handleFinishUp}
                  disabled={loading}
                  className="flex-1 p-3 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-60"
                >
                  {loading ? 'SAVING...' : 'FINISH UP'}
                </button>
              </div>
            </div>
          </div>
        )
      }