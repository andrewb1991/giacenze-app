// main.dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(AutomandoApp());
}

class AutomandoApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Giacenze App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: SplashScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class SplashScreen extends StatefulWidget {
  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Naviga alla WebView dopo 2 secondi
    Future.delayed(Duration(seconds: 2), () {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => WebViewScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue[50],
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo o icona dell'app
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.blue[600],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                Icons.inventory_2,
                size: 60,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 30),
            Text(
              'Giacenze App',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.blue[800],
              ),
            ),
            SizedBox(height: 10),
            Text(
              'Gestione Giacenze',
              style: TextStyle(
                fontSize: 18,
                color: Colors.blue[600],
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 50),
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
            ),
          ],
        ),
      ),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  @override
  _WebViewScreenState createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController controller;
  bool isLoading = true;
  bool hasConnection = true;
  String? errorMessage;
  
  // Sostituisci con l'URL della tua webapp
  final String webAppUrl = 'https://resourceful-serenity-production.up.railway.app/';

  @override
  void initState() {
    super.initState();
    checkConnection();
    initWebView();
  }

  void initWebView() {
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent('AutomandoApp/1.0')
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              isLoading = true;
              errorMessage = null;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              isLoading = false;
              errorMessage = 'Errore di caricamento: ${error.description}';
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(webAppUrl));
  }

  void checkConnection() async {
    var connectivityResult = await Connectivity().checkConnectivity();
    setState(() {
      hasConnection = connectivityResult != ConnectivityResult.none;
    });
    
    if (hasConnection && errorMessage != null) {
      // Ricarica se la connessione è tornata
      controller.reload();
    }
  }

  Future<bool> _onWillPop() async {
    if (await controller.canGoBack()) {
      controller.goBack();
      return false;
    }
    return await _showExitDialog() ?? false;
  }

  Future<bool?> _showExitDialog() async {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Uscire dall\'app?'),
        content: Text('Vuoi davvero chiudere l\'applicazione?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text('Annulla'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text('Esci'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              Icon(Icons.inventory_2, size: 24),
              SizedBox(width: 8),
              Text('Gestione Giacenze'),
            ],
          ),
          backgroundColor: Colors.blue[600],
          foregroundColor: Colors.white,
          elevation: 2,
          actions: [
            // Pulsante refresh
            IconButton(
              icon: Icon(Icons.refresh),
              onPressed: () {
                HapticFeedback.lightImpact();
                controller.reload();
              },
            ),
            // Menu opzioni
            PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'home':
                    controller.loadRequest(Uri.parse(webAppUrl));
                    break;
                  case 'forward':
                    controller.goForward();
                    break;
                  case 'reload':
                    controller.reload();
                    break;
                }
              },
              itemBuilder: (BuildContext context) => [
                PopupMenuItem(
                  value: 'home',
                  child: Row(
                    children: [
                      Icon(Icons.home, color: Colors.blue[600]),
                      SizedBox(width: 8),
                      Text('Home'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'forward',
                  child: Row(
                    children: [
                      Icon(Icons.arrow_forward, color: Colors.blue[600]),
                      SizedBox(width: 8),
                      Text('Avanti'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'reload',
                  child: Row(
                    children: [
                      Icon(Icons.refresh, color: Colors.blue[600]),
                      SizedBox(width: 8),
                      Text('Ricarica'),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
        body: Stack(
          children: [
            // WebView principale
            if (hasConnection && errorMessage == null)
              WebViewWidget(controller: controller),
            
            // Schermata errore connessione
            if (!hasConnection)
              _buildNoConnectionScreen(),
            
            // Schermata errore generico
            if (hasConnection && errorMessage != null)
              _buildErrorScreen(),
            
            // Indicatore di caricamento
            if (isLoading && hasConnection && errorMessage == null)
              Container(
                color: Colors.white,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[600]!),
                      ),
                      SizedBox(height: 20),
                      Text(
                        'Caricamento...',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.blue[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoConnectionScreen() {
    return Container(
      color: Colors.white,
      child: Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.wifi_off,
                size: 80,
                color: Colors.grey[400],
              ),
              SizedBox(height: 24),
              Text(
                'Nessuna connessione',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[600],
                ),
              ),
              SizedBox(height: 12),
              Text(
                'Controlla la tua connessione internet e riprova',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[500],
                ),
              ),
              SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: () {
                  HapticFeedback.lightImpact();
                  checkConnection();
                },
                icon: Icon(Icons.refresh),
                label: Text('Riprova'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[600],
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildErrorScreen() {
    return Container(
      color: Colors.white,
      child: Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 80,
                color: Colors.red[300],
              ),
              SizedBox(height: 24),
              Text(
                'Errore di caricamento',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[600],
                ),
              ),
              SizedBox(height: 12),
              Text(
                errorMessage ?? 'Si è verificato un errore imprevisto',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[500],
                ),
              ),
              SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      checkConnection();
                    },
                    icon: Icon(Icons.wifi),
                    label: Text('Verifica rete'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey[600],
                      foregroundColor: Colors.white,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      controller.reload();
                    },
                    icon: Icon(Icons.refresh),
                    label: Text('Ricarica'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[600],
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}