<?php
/**
 * Distribution ERP2 - Entry point for XAMPP Apache (Port 80)
 * Redirects automatically to the modern Vite Frontend (Port 3000)
 */

$host = $_SERVER['SERVER_NAME'] ?? 'localhost';
$port = isset($_GET['port']) ? intval($_GET['port']) : 5173;
$viteHost = "http://{$host}:{$port}";
$targetUrl = $viteHost . '/customer/home';

// Optional: If direct redirect header is allowed
if (!isset($_GET['hub'])) {
    header("Location: $targetUrl");
    // Fall through to display launchpad if redirect is not followed
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hercules Distribution ERP — Lancement</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: #090e17;
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .hub-card {
            background: #111827;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            max-width: 540px;
            width: 100%;
            padding: 40px 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            text-align: center;
        }
        .badge {
            display: inline-block;
            background: rgba(2, 132, 199, 0.15);
            color: #38bdf8;
            font-size: 11px;
            font-weight: 800;
            padding: 5px 12px;
            border-radius: 99px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            margin-bottom: 16px;
        }
        h1 {
            font-size: 26px;
            font-weight: 900;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        p {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .btn-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14.5px;
            transition: all 0.2s ease;
        }
        .btn-primary {
            background: #0284c7;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
        }
        .btn-primary:hover {
            background: #0369a1;
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: #1e293b;
            color: #f1f5f9;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-secondary:hover {
            background: #334155;
            transform: translateY(-2px);
        }
        .btn small {
            font-size: 11px;
            font-weight: 500;
            opacity: 0.8;
            display: block;
            margin-top: 2px;
        }
        .arrow { font-size: 18px; }
        .footer {
            margin-top: 28px;
            font-size: 12px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="hub-card">
        <span class="badge">Système ERP & Espace Client B2B</span>
        <h1>Hercules Distribution</h1>
        <p>Sélectionnez le portail auquel vous souhaitez accéder ou attendez la redirection automatique :</p>

        <div class="btn-grid">
            <a class="btn btn-primary" href="<?php echo htmlspecialchars($viteHost); ?>/customer/home">
                <div style="text-align: left;">
                    <span>🛍️ Espace Client B2B (Grossistes)</span>
                    <small>Catalogue dégressif, panier, suivi commandes & factures</small>
                </div>
                <span class="arrow">→</span>
            </a>

            <a class="btn btn-secondary" href="<?php echo htmlspecialchars($viteHost); ?>/login">
                <div style="text-align: left;">
                    <span>🏢 Portail ERP Interne (Staff)</span>
                    <small>Admin, Commercial, Responsable Dépôt, Préparation, Livreur, Compta</small>
                </div>
                <span class="arrow">→</span>
            </a>

            <a class="btn btn-secondary" href="http://localhost:8000" target="_blank">
                <div style="text-align: left;">
                    <span>⚡ Serveur API Laravel (Port 8000)</span>
                    <small>État du backend et base de données MySQL</small>
                </div>
                <span class="arrow">↗</span>
            </a>
        </div>

        <div class="footer">
            Serveur Frontend actif sur <code><?php echo htmlspecialchars($viteHost); ?></code>
        </div>
    </div>
    <script>
        // Automatic redirection after 1.5 seconds if accessed directly
        setTimeout(function() {
            window.location.href = "<?php echo $targetUrl; ?>";
        }, 1500);
    </script>
</body>
</html>
