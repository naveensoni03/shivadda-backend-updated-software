import os

# Add route to App.jsx
app_jsx_path = r'frontend\src\App.jsx'
with open(app_jsx_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the services route and add service-types route after it
if '/services' in content and '/service-types' not in content:
    content = content.replace(
        '           <Route path="/services" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ServiceMaster /></ProtectedRoute>} />\n           <Route path="/access-logs"',
        '           <Route path="/services" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ServiceMaster /></ProtectedRoute>} />\n           <Route path="/service-types" element={<ProtectedRoute allowedRoles={ADMIN_ONLY}><ServiceTypes /></ProtectedRoute>} />\n           <Route path="/access-logs"'
    )
    with open(app_jsx_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ App.jsx route added successfully")
else:
    print("⚠️  Service-types route already exists or services route not found")

# Add to SidebarModern
sidebar_path = r'frontend\src\components\SidebarModern.jsx'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'Homework & Tasks' in content and '/service-types' not in content:
    # Find and replace after homework line
    old_homework_section = '''                   <NavLink to="/homework" style={linkStyle} onClick={() => setIsMobileOpen(false)}><SerialNo num="8" /> Homework & Tasks</NavLink>
                 </>
               )}
             </>
           )}'''
    
    new_homework_section = '''                   <NavLink to="/homework" style={linkStyle} onClick={() => setIsMobileOpen(false)}><SerialNo num="8" /> Homework & Tasks</NavLink>
                 </>
               )}

               {/* 🔥 TYPES OF SERVICES */}
               {isManagement && (
                 <NavLink to="/service-types" style={linkStyle} onClick={() => setIsMobileOpen(false)}><SerialNo num="9" /> Types of Services</NavLink>
               )}
             </>
           )}'''
    
    if old_homework_section in content:
        content = content.replace(old_homework_section, new_homework_section)
        with open(sidebar_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ SidebarModern.jsx updated successfully")
    else:
        print("⚠️  Could not find homework section in SidebarModern")
else:
    print("⚠️  Service types already in sidebar or homework section not found")

print("\n✅ All updates completed!")
